import { SignJWT, jwtVerify } from 'jose';
import type { SessionUser } from '@/types';

const COOKIE_NAME = 'mp_admin_session';
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'mp-lubricentro-dev-secret-change-in-production'
);
const SESSION_DURATION = 60 * 60 * 8; // 8 hours max, inactivity handled client-side

export { COOKIE_NAME };

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
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
