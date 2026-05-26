import type { Cliente, Vehiculo } from '@/types';
import { addAuditLog, getDb, saveDb } from './store';
import { generateId } from '@/lib/utils';

export async function listClientes(search?: string): Promise<Cliente[]> {
  const db = await getDb();
  let items = [...db.clientes];
  if (search) {
    const q = search.toLowerCase();
    items = items.filter(
      (c) =>
        c.nombre.toLowerCase().includes(q) ||
        c.dni?.includes(q) ||
        c.telefono?.includes(q) ||
        c.email?.toLowerCase().includes(q)
    );
  }
  return items.sort((a, b) => a.nombre.localeCompare(b.nombre));
}

export async function getCliente(id: string): Promise<Cliente | null> {
  const db = await getDb();
  return db.clientes.find((c) => c.id === id) ?? null;
}

export async function createCliente(
  data: Omit<Cliente, 'id' | 'createdAt' | 'saldoCuentaCorriente'>,
  userId: string
): Promise<Cliente> {
  const db = await getDb();
  const cliente: Cliente = {
    ...data,
    id: generateId('cli-'),
    saldoCuentaCorriente: 0,
    createdAt: new Date().toISOString(),
  };
  db.clientes.push(cliente);
  addAuditLog(db, 'crear', 'cliente', cliente.id, userId, cliente.nombre);
  await saveDb(db);
  return cliente;
}

export async function updateCliente(
  id: string,
  data: Partial<Cliente>,
  userId: string
): Promise<Cliente | null> {
  const db = await getDb();
  const idx = db.clientes.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  db.clientes[idx] = { ...db.clientes[idx], ...data, id };
  addAuditLog(db, 'actualizar', 'cliente', id, userId);
  await saveDb(db);
  return db.clientes[idx];
}

export async function deleteCliente(id: string, userId: string): Promise<boolean> {
  const db = await getDb();
  const idx = db.clientes.findIndex((c) => c.id === id);
  if (idx === -1) return false;
  db.clientes.splice(idx, 1);
  db.vehiculos = db.vehiculos.filter((v) => v.clienteId !== id);
  addAuditLog(db, 'eliminar', 'cliente', id, userId);
  await saveDb(db);
  return true;
}

export async function listVehiculos(clienteId?: string): Promise<Vehiculo[]> {
  const db = await getDb();
  let items = [...db.vehiculos];
  if (clienteId) items = items.filter((v) => v.clienteId === clienteId);
  return items.sort((a, b) => a.patente.localeCompare(b.patente));
}

export async function createVehiculo(
  data: Omit<Vehiculo, 'id' | 'createdAt'>,
  userId: string
): Promise<Vehiculo> {
  const db = await getDb();
  const vehiculo: Vehiculo = {
    ...data,
    patente: data.patente.toUpperCase(),
    id: generateId('veh-'),
    createdAt: new Date().toISOString(),
  };
  db.vehiculos.push(vehiculo);
  addAuditLog(db, 'crear', 'vehiculo', vehiculo.id, userId, vehiculo.patente);
  await saveDb(db);
  return vehiculo;
}

export async function updateVehiculo(
  id: string,
  data: Partial<Vehiculo>,
  userId: string
): Promise<Vehiculo | null> {
  const db = await getDb();
  const idx = db.vehiculos.findIndex((v) => v.id === id);
  if (idx === -1) return null;
  db.vehiculos[idx] = {
    ...db.vehiculos[idx],
    ...data,
    id,
    patente: data.patente?.toUpperCase() ?? db.vehiculos[idx].patente,
  };
  addAuditLog(db, 'actualizar', 'vehiculo', id, userId);
  await saveDb(db);
  return db.vehiculos[idx];
}

export async function deleteVehiculo(id: string, userId: string): Promise<boolean> {
  const db = await getDb();
  const idx = db.vehiculos.findIndex((v) => v.id === id);
  if (idx === -1) return false;
  db.vehiculos.splice(idx, 1);
  addAuditLog(db, 'eliminar', 'vehiculo', id, userId);
  await saveDb(db);
  return true;
}

export async function getHistorialVehiculo(vehiculoId: string) {
  const db = await getDb();
  return db.ordenesTrabajo
    .filter((ot) => ot.vehiculoId === vehiculoId)
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
}

export async function getAlertasService() {
  const db = await getDb();
  return db.vehiculos.filter((v) => {
    if (!v.kmProximoService || !v.kmActual) return false;
    return v.kmActual >= v.kmProximoService - 500;
  });
}
