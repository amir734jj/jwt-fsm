import moment from 'moment';
import { validate, tokenExpiresAt } from './utility';

type Logger = {
  info: (_: string) => void;
  error: (_: string) => void;
};

export type JwtFsmOptions = {
  renew: () => Promise<string>;
  recover: () => Promise<string>;
  persist: (_: string) => Promise<void>;
  renewal?: number;
  logger?: Logger;
};

export class JwtFsm {
  private readonly renewal: number;

  private renewalTimer: ReturnType<typeof setTimeout> | null = null;

  private tokenValue: string;

  private logger: Logger;

  private readonly recover: () => Promise<string>;

  private readonly renew: () => Promise<string>;

  private readonly persist: (_: string) => Promise<void>;

  /**
   * Constructor
   * @param options options
   */
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
    this.persist = options.persist;

    this.init();
  }

  /**
   * Instantiation initialization
   */
  private async init() {
    await this.recoverToken();
    this.scheduleRenewal();
    this.logger.info('init: Successfully initialized the JWT-FSM.');
  }

  /**
   * Recovers the token
   */
  private async recoverToken(): Promise<void> {
    const token = await this.recover();
    if (token && !validate(token)) {
      this.logger.error('recoverToken: Token is not valid.');
    } else {
      this.tokenValue = token;
      await this.persist(this.token);
    }
  }

  /**
   * Manually sets the token
   * @param token
   */
  public async setToken(token: string): Promise<void> {
    if (!token || !validate(token)) {
      this.logger.error('setToken: Token is not valid.');
      throw new Error('Token is not valid.');
    }

    this.tokenValue = token;
    await this.persist(this.token);

    if (this.renewalTimer) {
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
    if (!this.token) {
      this.logger.info(
        'scheduleRenewal: Token is empty, skipping renewal scheduling.',
      );
      return;
    }

    if (!validate(this.token)) {
      this.logger.info(
        'scheduleRenewal: Token is not valid, skipping renewal scheduling.',
      );
      return;
    }

    let renewal = moment
      .duration(moment(tokenExpiresAt(this.token)).diff(moment()))
      .subtract(this.renewal, 'minutes')
      .asMilliseconds();

    // If token expiration is imminent
    // then review the token now
    if (renewal < this.renewal * 60 * 1000) {
      renewal = 0;
      this.logger.info(
        'scheduleRenewal: Token expiration is imminent, triggering renewal now.',
      );
    }
    this.renewalTimer = setTimeout(async () => {
      this.tokenValue = await this.renew();
      await this.persist(this.token);
      this.scheduleRenewal();
    }, renewal);
  }

  /**
   * Clear renewal schedule
   */
  public dispose(): void {
    if (this.renewalTimer) {
      clearTimeout(this.renewalTimer);
      this.logger.info(
        'dispose: Successfully disposed the token renewal schedule.',
      );
    }
  }
}
