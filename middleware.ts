import { NextResponse, type NextRequest } from 'next/server';
import { PORTAL_TOKEN_COOKIE } from '@/lib/portal-storage';

const ADMIN_COOKIE = 'mp_admin_session';
const ONE_YEAR = 60 * 60 * 24 * 365;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Guardar token del portal en cookie (persiste en acceso directo iOS/Android)
  const portalMatch = pathname.match(/^\/portal\/([^/]+)$/);
  if (portalMatch?.[1]) {
    const response = NextResponse.next();
    response.cookies.set(PORTAL_TOKEN_COOKIE, portalMatch[1], {
      path: '/',
      maxAge: ONE_YEAR,
      sameSite: 'lax',
      secure: request.nextUrl.protocol === 'https:',
    });
    return response;
  }

  if (pathname === '/admin/login' || pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get(ADMIN_COOKIE)?.value;
    if (!token) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/portal', '/portal/:path*'],
};
