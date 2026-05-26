import { NextResponse, type NextRequest } from 'next/server';
import { COOKIE_NAME, getSessionFromCookie } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith('/admin');
  const isLoginPage = pathname === '/admin/login';
  const isApiAuth = pathname.startsWith('/api/auth');

  if (!isAdminRoute || isLoginPage || isApiAuth) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  const session = await getSessionFromCookie(token);

  if (!session || (session.rol !== 'admin' && session.rol !== 'tecnico')) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
