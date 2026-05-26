import type { NextRequest } from 'next/server';
import { COOKIE_NAME, getSessionFromCookie } from '@/lib/auth';
import type { SessionUser } from '@/types';

export async function getSession(request: NextRequest): Promise<SessionUser | null> {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  return getSessionFromCookie(token);
}

export function requireAdmin(session: SessionUser | null): session is SessionUser {
  return session?.rol === 'admin' || session?.rol === 'tecnico';
}

export function requireAdminOnly(session: SessionUser | null): session is SessionUser {
  return session?.rol === 'admin';
}
