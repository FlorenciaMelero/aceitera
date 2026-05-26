import { SignJWT, jwtVerify } from 'jose';
import type { SessionUser } from '@/types';
import { COOKIE_NAME, SESSION_DURATION, getJwtSecret } from './auth/constants';

export { COOKIE_NAME };

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(getJwtSecret());
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}

export async function getSessionFromCookie(
  cookieValue: string | undefined
): Promise<SessionUser | null> {
  if (!cookieValue) return null;
  return verifySessionToken(cookieValue);
}
