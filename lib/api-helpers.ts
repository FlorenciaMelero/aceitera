import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { COOKIE_NAME, getSessionFromCookie } from '@/lib/auth';
import type { SessionUser } from '@/types';

export async function getApiSession(request: NextRequest): Promise<SessionUser | null> {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  return getSessionFromCookie(token);
}

export function unauthorized() {
  return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
}

export function forbidden() {
  return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
}

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}
