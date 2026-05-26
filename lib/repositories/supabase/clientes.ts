import type { Cliente, Vehiculo } from '@/types';
import { getSupabaseAdmin } from './client';
import {
  clienteToRow,
  mapCliente,
  mapVehiculo,
  vehiculoToRow,
  type ClienteRow,
  type VehiculoRow,
} from './mappers';

export async function listClientes(search?: string): Promise<Cliente[]> {
  const sb = getSupabaseAdmin();
  let query = sb.from('clientes').select('*').order('nombre');

  if (search?.trim()) {
    const q = `%${search.trim()}%`;
    query = query.or(`nombre.ilike.${q},dni.ilike.${q},telefono.ilike.${q},email.ilike.${q}`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return ((data ?? []) as ClienteRow[]).map(mapCliente);
}

export async function getCliente(id: string): Promise<Cliente | null> {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb.from('clientes').select('*').eq('id', id).maybeSingle();
  if (error || !data) return null;
  return mapCliente(data as ClienteRow);
}

export async function createCliente(
  data: Omit<Cliente, 'id' | 'createdAt' | 'saldoCuentaCorriente'>,
  userId: string
): Promise<Cliente> {
  const sb = getSupabaseAdmin();
  const row = {
    ...clienteToRow(data),
    saldo_cuenta_corriente: 0,
  };

  const { data: created, error } = await sb.from('clientes').insert(row).select('*').single();
  if (error) throw new Error(error.message);

  await logAudit('crear', 'cliente', created.id, userId, data.nombre);
  return mapCliente(created as ClienteRow);
}

export async function updateCliente(
  id: string,
  data: Partial<Cliente>,
  userId: string
): Promise<Cliente | null> {
  const sb = getSupabaseAdmin();
  const { data: updated, error } = await sb
    .from('clientes')
    .update(clienteToRow(data))
    .eq('id', id)
    .select('*')
    .maybeSingle();

  if (error || !updated) return null;
  await logAudit('actualizar', 'cliente', id, userId);
  return mapCliente(updated as ClienteRow);
}

export async function deleteCliente(id: string, userId: string): Promise<boolean> {
  const sb = getSupabaseAdmin();
  const { error } = await sb.from('clientes').delete().eq('id', id);
  if (error) return false;
  await logAudit('eliminar', 'cliente', id, userId);
  return true;
}

export async function listVehiculos(clienteId?: string): Promise<Vehiculo[]> {
  const sb = getSupabaseAdmin();
  let query = sb.from('vehiculos').select('*').order('patente');
  if (clienteId) query = query.eq('cliente_id', clienteId);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return ((data ?? []) as VehiculoRow[]).map(mapVehiculo);
}

export async function createVehiculo(
  data: Omit<Vehiculo, 'id' | 'createdAt'>,
  userId: string
): Promise<Vehiculo> {
  const sb = getSupabaseAdmin();
  const { data: created, error } = await sb
    .from('vehiculos')
    .insert(vehiculoToRow(data))
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  await logAudit('crear', 'vehiculo', created.id, userId, data.patente.toUpperCase());
  return mapVehiculo(created as VehiculoRow);
}

export async function updateVehiculo(
  id: string,
  data: Partial<Vehiculo>,
  userId: string
): Promise<Vehiculo | null> {
  const sb = getSupabaseAdmin();
  const { data: updated, error } = await sb
    .from('vehiculos')
    .update(vehiculoToRow(data))
    .eq('id', id)
    .select('*')
    .maybeSingle();

  if (error || !updated) return null;
  await logAudit('actualizar', 'vehiculo', id, userId);
  return mapVehiculo(updated as VehiculoRow);
}

export async function deleteVehiculo(id: string, userId: string): Promise<boolean> {
  const sb = getSupabaseAdmin();
  const { error } = await sb.from('vehiculos').delete().eq('id', id);
  if (error) return false;
  await logAudit('eliminar', 'vehiculo', id, userId);
  return true;
}

export async function getHistorialVehiculo(vehiculoId: string) {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from('ordenes_trabajo')
    .select('*')
    .eq('vehiculo_id', vehiculoId)
    .order('fecha', { ascending: false });

  if (error) return [];
  return (data ?? []).map((row) => ({
    id: row.id,
    numero: row.numero,
    clienteId: row.cliente_id,
    vehiculoId: row.vehiculo_id,
    fecha: row.fecha,
    estado: row.estado,
    kmIngreso: row.km_ingreso ?? undefined,
    total: Number(row.total),
    createdAt: row.created_at,
  }));
}

export async function getAlertasService() {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb.from('vehiculos').select('*');
  if (error) return [];

  return ((data ?? []) as VehiculoRow[])
    .map(mapVehiculo)
    .filter((v) => {
      if (!v.kmProximoService || !v.kmActual) return false;
      return v.kmActual >= v.kmProximoService - 500;
    });
}

async function logAudit(
  accion: string,
  entidad: string,
  entidadId: string,
  userId: string,
  detalle?: string
) {
  const sb = getSupabaseAdmin();
  await sb.from('audit_log').insert({
    accion,
    entidad,
    entidad_id: entidadId,
    usuario_id: isUuid(userId) ? userId : null,
    detalle: detalle ?? null,
  });
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}
