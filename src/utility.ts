import moment from 'moment';
import JwtDecode, { JwtPayload } from 'jwt-decode';

/**
 * Utility function that returns the Date object of when token expires
 * @return Date object of when token expires
 * @private
 */
export function tokenExpiresAt(token: string): Date {
  const { exp }: JwtPayload & { exp: number } = JwtDecode(token);
  return new Date(exp * 1000);
}

/**
 * Static function that validate token
 * @param token
 * @private
 */
export function validate(token: string): boolean {
  return (
    moment
      .duration(moment(moment()).diff(tokenExpiresAt(token)))
      .asMilliseconds() > 0
  );
}
