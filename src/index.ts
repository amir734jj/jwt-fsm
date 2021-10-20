import moment from 'moment';
import { validate, tokenExpiresAt } from './utility';

type Logger = {
  info: (_: string) => void;
  error: (_: string) => void;
};

export type JwtFsmOptions = {
  renew: () => Promise<string>;
  recover: () => Promise<string>;
  renewal?: number;
  logger?: Logger;
};

export class JwtFsm {
  private renewal: number;

  private renewalTimer: ReturnType<typeof setTimeout> | null = null;

  private tokenValue: string;

  private logger: Logger;

  private recover: () => Promise<string>;

  private renew: () => Promise<string>;

  constructor(options: JwtFsmOptions) {
    if (!options.logger) {
      this.logger = {
        info: (text) => console.log(text),
        error: (text) => console.error(text),
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
    if (token && !validate(token)) {
      this.logger.error('recoverToken: Token is not valid.');
    }

    this.tokenValue = token;
  }

  /**
   * Manually sets the token
   * @param token
   */
  public setToken(token: string): void {
    if (!token || !validate(token)) {
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
    if (this.tokenValue && !validate(this.tokenValue)) {
      this.logger.error('Token is not valid.');
    }

    return this.tokenValue || '';
  }

  /**
   * Utility function that schedules renewal of JWT token
   * @private
   */
  private scheduleRenewal(): void {
    const now = moment();
    const expiresAt = tokenExpiresAt(this.token);
    let renewal = moment
      .duration(moment(expiresAt).diff(now))
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

  public dispose(): void {
    if (this.renewalTimer) {
      clearTimeout(this.renewalTimer);
    }
  }
}
