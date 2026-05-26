import { jwtVerify } from 'jose';
import type { SessionUser } from '@/types';
import { COOKIE_NAME, getJwtSecret } from './constants';

export { COOKIE_NAME };

/** Edge-safe session verification for middleware */
export async function getSessionFromCookie(
  cookieValue: string | undefined
): Promise<SessionUser | null> {
  if (!cookieValue) return null;
  try {
    const { payload } = await jwtVerify(cookieValue, getJwtSecret());
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}
