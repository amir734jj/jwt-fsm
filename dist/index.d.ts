import * as winston from "winston";
export declare type JwtFsmOptions = {
    renew: () => Promise<string>;
    recover: () => Promise<string>;
    renewal?: number;
    logger?: winston.Logger;
};
export declare class JwtFsm {
    private _options;
    private _renewalTimer;
    private _token;
    constructor(options: JwtFsmOptions);
    private init;
    private recoverToken;
    /**
     * Static function that validate token
     * @param token
     * @private
     */
    private static validate;
    /**
     * Manually sets the token
     * @param token
     */
    setToken(token: string): void;
    /**
     * Returns the token value
     * @private
     */
    token(): string;
    /**
     * Utility function that schedules renewal of JWT token
     * @private
     */
    private scheduleRenewal;
    /**
     * Utility function that returns the Date object of when token expires
     * @return Date object of when token expires
     * @private
     */
    private static tokenExpires;
}
