import type { SessionUser } from '@/types';
import { getDb } from '@/lib/repositories/mock/store';
import { hashPasswordSync } from '@/lib/utils';

const DEFAULT_ADMIN = {
  email: 'admin@lubricentro.local',
  password: 'Admin123!',
  nombre: 'Administrador',
};

/** Login admin por env — funciona en Vercel sin store.json */
function authenticateFromEnv(email: string, password: string): SessionUser | null {
  const adminEmail = process.env.ADMIN_EMAIL || DEFAULT_ADMIN.email;
  const adminPassword = process.env.ADMIN_PASSWORD || DEFAULT_ADMIN.password;

  if (
    email.toLowerCase() === adminEmail.toLowerCase() &&
    password === adminPassword
  ) {
    return {
      id: 'admin-env',
      email: adminEmail,
      nombre: DEFAULT_ADMIN.nombre,
      rol: 'admin',
    };
  }
  return null;
}

export async function authenticateAdmin(
  email: string,
  password: string
): Promise<SessionUser | null> {
  const fromEnv = authenticateFromEnv(email, password);
  if (fromEnv) return fromEnv;

  try {
    const db = await getDb();
    const user = db.usuarios.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.activo
    );
    if (!user || user.passwordHash !== hashPasswordSync(password)) return null;
    if (user.rol !== 'admin' && user.rol !== 'tecnico') return null;

    return {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      rol: user.rol,
    };
  } catch {
    return null;
  }
}
