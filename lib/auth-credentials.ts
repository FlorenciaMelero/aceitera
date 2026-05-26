import type { SessionUser } from '@/types';
import { getDb } from '@/lib/repositories/mock/store';
import { hashPasswordSync } from '@/lib/utils';

export async function authenticateAdmin(
  email: string,
  password: string
): Promise<SessionUser | null> {
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
}
