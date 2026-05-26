import type { CajaMovimiento, MetodoPago, Proveedor } from '@/types';
import { addAuditLog, getDb, saveDb } from './store';
import { generateId } from '@/lib/utils';
import { startOfDay, startOfWeek, startOfMonth, isAfter } from 'date-fns';

export async function listCaja(desde?: string, hasta?: string) {
  const db = await getDb();
  let items = [...db.caja];
  if (desde) items = items.filter((c) => c.fecha >= desde);
  if (hasta) items = items.filter((c) => c.fecha <= hasta);
  return items.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
}

export async function createCajaMovimiento(
  data: Omit<CajaMovimiento, 'id'>,
  userId: string
): Promise<CajaMovimiento> {
  const db = await getDb();
  const mov: CajaMovimiento = { ...data, id: generateId('caja-') };
  db.caja.push(mov);

  if (data.tipo === 'ingreso' && data.metodoPago === 'cuenta_corriente' && data.clienteId) {
    const cliente = db.clientes.find((c) => c.id === data.clienteId);
    if (cliente) cliente.saldoCuentaCorriente += data.monto;
  }

  addAuditLog(db, 'crear', 'caja', mov.id, userId);
  await saveDb(db);
  return mov;
}

export async function getBalance(periodo: 'dia' | 'semana' | 'mes' = 'dia') {
  const db = await getDb();
  const now = new Date();
  const start =
    periodo === 'dia'
      ? startOfDay(now)
      : periodo === 'semana'
        ? startOfWeek(now, { weekStartsOn: 1 })
        : startOfMonth(now);

  const movimientos = db.caja.filter((c) => isAfter(new Date(c.fecha), start));
  const ingresos = movimientos.filter((c) => c.tipo === 'ingreso').reduce((s, c) => s + c.monto, 0);
  const egresos = movimientos.filter((c) => c.tipo === 'egreso').reduce((s, c) => s + c.monto, 0);

  return { ingresos, egresos, balance: ingresos - egresos, movimientos };
}

export async function listProveedores(): Promise<Proveedor[]> {
  const db = await getDb();
  return db.proveedores;
}

export async function createProveedor(
  data: Omit<Proveedor, 'id'>,
  userId: string
): Promise<Proveedor> {
  const db = await getDb();
  const prov: Proveedor = { ...data, id: generateId('prov-') };
  db.proveedores.push(prov);
  addAuditLog(db, 'crear', 'proveedor', prov.id, userId);
  await saveDb(db);
  return prov;
}

export async function updateProveedor(
  id: string,
  data: Partial<Proveedor>,
  userId: string
): Promise<Proveedor | null> {
  const db = await getDb();
  const idx = db.proveedores.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  db.proveedores[idx] = { ...db.proveedores[idx], ...data, id };
  addAuditLog(db, 'actualizar', 'proveedor', id, userId);
  await saveDb(db);
  return db.proveedores[idx];
}

export async function getSugerenciasCompra() {
  const db = await getDb();
  return db.productos
    .filter((p) => p.stock <= p.stockMinimo && p.activo)
    .map((p) => {
      const prov = db.proveedores.find((pr) => pr.id === p.proveedorId);
      return {
        producto: p,
        cantidadSugerida: p.stockMinimo * 2 - p.stock,
        proveedor: prov,
      };
    });
}

export async function listCuentasCorrientes() {
  const db = await getDb();
  return db.clientes.filter((c) => c.saldoCuentaCorriente > 0);
}

export async function listUsuarios() {
  const db = await getDb();
  return db.usuarios.map(({ passwordHash, ...u }) => u);
}

export async function getConfiguracion() {
  const db = await getDb();
  return db.configuracion;
}

export async function updateConfiguracion(
  data: Partial<import('@/types').Configuracion>,
  userId: string
) {
  const db = await getDb();
  db.configuracion = { ...db.configuracion, ...data };
  addAuditLog(db, 'actualizar', 'configuracion', db.configuracion.id, userId);
  await saveDb(db);
  return db.configuracion;
}

export async function listCombos() {
  const db = await getDb();
  return db.combos;
}

export async function saveCombo(
  data: { nombre: string; descripcion?: string; productoIds: string[]; precio: number },
  userId: string,
  id?: string
) {
  const db = await getDb();
  const comboId = id || generateId('combo-');
  const combo = { id: comboId, ...data };
  const idx = db.combos.findIndex((c) => c.id === comboId);
  if (idx >= 0) db.combos[idx] = combo;
  else db.combos.push(combo);
  addAuditLog(db, id ? 'actualizar' : 'crear', 'combo', comboId, userId);
  await saveDb(db);
  return combo;
}

export async function deleteCombo(id: string, userId: string) {
  const db = await getDb();
  db.combos = db.combos.filter((c) => c.id !== id);
  addAuditLog(db, 'eliminar', 'combo', id, userId);
  await saveDb(db);
}

export async function listCategoriasMarcas(tipo?: 'categoria' | 'marca') {
  const db = await getDb();
  let items = db.categoriasMarcas;
  if (tipo) items = items.filter((c) => c.tipo === tipo);
  return items;
}

export async function saveCategoriaMarca(
  nombre: string,
  tipo: 'categoria' | 'marca',
  userId: string,
  id?: string
) {
  const db = await getDb();
  if (id) {
    const item = db.categoriasMarcas.find((c) => c.id === id);
    if (item) item.nombre = nombre;
  } else {
    db.categoriasMarcas.push({ id: generateId('cm-'), tipo, nombre });
  }
  addAuditLog(db, id ? 'actualizar' : 'crear', tipo, id || nombre, userId);
  await saveDb(db);
  return db.categoriasMarcas;
}

export async function getProductosPorVencer() {
  const db = await getDb();
  const now = new Date();
  const limit = new Date();
  limit.setDate(limit.getDate() + 30);
  return db.lotes.filter((l) => {
    if (!l.vencimiento) return false;
    const v = new Date(l.vencimiento);
    return v >= now && v <= limit;
  });
}

export async function getAuditLog(limit = 50) {
  const db = await getDb();
  return db.auditLog.slice(0, limit);
}
