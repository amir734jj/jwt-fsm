import JwtDecode, { JwtPayload } from 'jwt-decode';
import moment from 'moment';
import * as winston from 'winston';

type Logger = {
    info: ((_: string) => void),
    error: ((_: string) => void)
}

export type JwtFsmOptions = {
    renew: () => Promise<string>,
    recover: () => Promise<string>,
    renewal?: number,
    logger?: Logger
}

export class JwtFsm {
    private renewal: number;

    private renewalTimer: ReturnType<typeof setTimeout> | null = null;

    private tokenValue: string;

    private logger: Logger;

    private recover: () => Promise<string>;

    private renew: () => Promise<string>;

    constructor(options: JwtFsmOptions) {
      if (!options.logger) {
        const logger = winston.createLogger({
          format: winston.format.json(),
          level: 'info',
          defaultMeta: { service: 'jwt-fsm-service' },
        });

        this.logger = {
          info: (text) => logger.error(text),
          error: (text) => logger.error(text),
        };
      } else {
        this.logger = options.logger;
      }

      if (!options.renewal) {
        this.renewal = 5;
      } else {
        this.renewal = options.renewal;
      }

      this.tokenValue = '';
      this.renewalTimer = null;

      this.recover = options.recover;
      this.renew = options.renew;

      this.init();
    }

    private async init() {
      await this.recoverToken();
      this.scheduleRenewal();
    }

    private async recoverToken() {
      const token = await this.recover();
      if (token && !JwtFsm.validate(token)) {
        this.logger.error('recoverToken: Token is not valid.');
      }

      this.tokenValue = token;
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
        this.logger.error('setToken: Token is not valid.');
        throw new Error('Token is not valid.');
      }

      this.tokenValue = token;
      if (this.renewalTimer != null) {
        clearTimeout(this.renewalTimer);
      }
      this.scheduleRenewal();
    }

    /**
     * Returns the token value
     * @private
     */
    get token(): string {
      if (this.tokenValue && !JwtFsm.validate(this.tokenValue)) {
        this.logger.error('Token is not valid.');
      }

      return this.tokenValue || '';
    }

    /**
     * Utility function that schedules renewal of JWT token
     * @private
     */
    private scheduleRenewal(): void {
      let renewal = moment.duration(moment(JwtFsm.tokenExpires(this.token))
        .diff(moment()))
        .subtract(this.renewal, 'minutes')
        .asMilliseconds();

      if (renewal <= 0) {
        renewal = 0;
      }

      this.renewalTimer = setTimeout(async () => {
        this.tokenValue = await this.renew();
        this.scheduleRenewal();
      }, renewal);
    }

    /**
     * Utility function that returns the Date object of when token expires
     * @return Date object of when token expires
     * @private
     */
    private static tokenExpires(token: string): Date {
      const { exp }: JwtPayload & { exp: number } = JwtDecode(token);
      return new Date(exp * 1000);
    }
}
