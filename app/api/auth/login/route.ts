import { NextResponse } from 'next/server';
import { authenticateAdmin } from '@/lib/auth-credentials';
import { createSessionToken, COOKIE_NAME } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email y contraseña requeridos' }, { status: 400 });
    }

    const user = await authenticateAdmin(email, password);
    if (!user) {
      return NextResponse.json({ error: 'Credenciales inválidas o sin permisos' }, { status: 401 });
    }

    if (user.rol !== 'admin') {
      return NextResponse.json({ error: 'Solo administradores pueden ingresar' }, { status: 403 });
    }

    const token = await createSessionToken(user);
    const response = NextResponse.json({ user });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 8,
    });
    return response;
  } catch {
    return NextResponse.json({ error: 'Error al iniciar sesión' }, { status: 500 });
  }
}
