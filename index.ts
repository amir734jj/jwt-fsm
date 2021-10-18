import JwtDecode, {JwtPayload} from "jwt-decode";
import moment from 'moment';
import * as winston from "winston";

export type JwtFsmOptions = {
    renew: () => Promise<string>,
    recover: () => Promise<string>,
    renewal?: number,
    logger?: winston.Logger
}

export class JwtFsm {
    private _options: JwtFsmOptions & { logger: winston.Logger };
    private _renewalTimer: NodeJS.Timeout | null = null;
    private _token: string | null = null;

    constructor(options: JwtFsmOptions) {
        this._options = Object.assign({},{
            renewal: 5,
            logger: winston.createLogger({
                format: winston.format.json(),
                level: 'info',
                defaultMeta: { service: 'jwt-fsm-service' },
            }),
        }, options);
        this.init();
    }

    private async init() {
        await this.recoverToken();
        this.scheduleRenewal();
    }

    private async recoverToken() {
        const token = await this._options.recover();
        if (token && !JwtFsm.validate(token)) {
            this._options.logger.error("recoverToken: Token is not valid.");
        }

        this._token = token;
    }

    /**
     * Static function that validate token
     * @param token
     * @private
     */
    private static validate(token: string): boolean {
        return moment.duration(moment(JwtFsm.tokenExpires(token))
            .diff(moment()))
            .asMilliseconds() > 0;
    }

    /**
     * Manually sets the token
     * @param token
     */
    public setToken(token: string): void {
        if (!token || !JwtFsm.validate(token)) {
            this._options.logger.error("setToken: Token is not valid.");
            throw new Error("Token is not valid.")
        }

        this._token = token;
        if (this._renewalTimer != null) {
            clearTimeout(this._renewalTimer);
        }
        this.scheduleRenewal();
    }

    /**
     * Returns the token value
     * @private
     */
    public token(): string {
        if (this._token && !JwtFsm.validate(this._token)) {
            this._options.logger.error("Token is not valid.");
        }

        return this._token || "";
    }

    /**
     * Utility function that schedules renewal of JWT token
     * @private
     */
    private scheduleRenewal(): void {
        let renewal = moment.duration(moment(JwtFsm.tokenExpires(this.token()))
            .diff(moment()))
            .subtract(this._options.renewal, 'minutes')
            .asMilliseconds();

        if (renewal <= 0) {
          renewal = 0;
        }

        this._renewalTimer = setTimeout(async () => {
            this._token = await this._options.renew();
            this.scheduleRenewal();
        }, renewal);
    }

    /**
     * Utility function that returns the Date object of when token expires
     * @return Date object of when token expires
     * @private
     */
    private static tokenExpires(token: string): Date {
        const {exp}: JwtPayload & { exp: number } = JwtDecode(token);
        return new Date(exp * 1000);
    }
}
