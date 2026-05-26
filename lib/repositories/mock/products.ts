import type {
  ImportResult,
  ImportRowError,
  MockDatabase,
  MovimientoStock,
  Producto,
} from '@/types';
import { addAuditLog, getDb, saveDb } from './store';
import { generateId } from '@/lib/utils';

export async function listProductos(filters?: {
  search?: string;
  categoria?: string;
  stockLevel?: 'bajo' | 'normal' | 'excesivo';
  activo?: boolean;
}): Promise<Producto[]> {
  const db = await getDb();
  let items = [...db.productos];

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    items = items.filter(
      (p) =>
        p.nombre.toLowerCase().includes(q) ||
        p.marca?.toLowerCase().includes(q) ||
        p.codigoBarras?.includes(q)
    );
  }
  if (filters?.categoria) {
    items = items.filter((p) => p.categoria === filters.categoria);
  }
  if (filters?.activo !== undefined) {
    items = items.filter((p) => p.activo === filters.activo);
  }
  if (filters?.stockLevel) {
    items = items.filter((p) => {
      if (filters.stockLevel === 'bajo') return p.stock <= p.stockMinimo;
      if (filters.stockLevel === 'excesivo') return p.stock > p.stockMinimo * 3;
      return p.stock > p.stockMinimo && p.stock <= p.stockMinimo * 3;
    });
  }

  return items.sort((a, b) => a.nombre.localeCompare(b.nombre));
}

export async function getProducto(id: string): Promise<Producto | null> {
  const db = await getDb();
  return db.productos.find((p) => p.id === id) ?? null;
}

export async function createProducto(
  data: Omit<Producto, 'id' | 'createdAt'>,
  userId: string
): Promise<Producto> {
  const db = await getDb();
  const producto: Producto = {
    ...data,
    id: generateId('prod-'),
    createdAt: new Date().toISOString(),
  };
  db.productos.push(producto);
  addAuditLog(db, 'crear', 'producto', producto.id, userId, producto.nombre);
  await saveDb(db);
  return producto;
}

export async function updateProducto(
  id: string,
  data: Partial<Producto>,
  userId: string
): Promise<Producto | null> {
  const db = await getDb();
  const idx = db.productos.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  db.productos[idx] = { ...db.productos[idx], ...data, id };
  addAuditLog(db, 'actualizar', 'producto', id, userId);
  await saveDb(db);
  return db.productos[idx];
}

export async function deleteProducto(id: string, userId: string): Promise<boolean> {
  const db = await getDb();
  const idx = db.productos.findIndex((p) => p.id === id);
  if (idx === -1) return false;
  db.productos.splice(idx, 1);
  addAuditLog(db, 'eliminar', 'producto', id, userId);
  await saveDb(db);
  return true;
}

export async function deductStock(
  db: MockDatabase,
  productoId: string,
  cantidad: number,
  motivo: string,
  otId?: string
): Promise<{ ok: boolean; error?: string; movimiento?: MovimientoStock }> {
  const producto = db.productos.find((p) => p.id === productoId);
  if (!producto) return { ok: false, error: 'Producto no encontrado' };
  if (producto.stock < cantidad) {
    return {
      ok: false,
      error: `Stock insuficiente para ${producto.nombre} (disponible: ${producto.stock})`,
    };
  }

  producto.stock -= cantidad;
  const movimiento: MovimientoStock = {
    id: generateId('mov-'),
    productoId,
    tipo: 'salida',
    cantidad,
    motivo,
    otId,
    fecha: new Date().toISOString(),
  };
  db.movimientosStock.unshift(movimiento);
  return { ok: true, movimiento };
}

export async function importProductos(
  rows: Record<string, unknown>[],
  userId: string
): Promise<ImportResult> {
  const db = await getDb();
  const result: ImportResult = { created: 0, updated: 0, errors: [] };

  rows.forEach((row, index) => {
    const rowNum = index + 2;
    const nombre = String(row.nombre || row.Nombre || '').trim();
    if (!nombre) {
      result.errors.push({ row: rowNum, field: 'nombre', message: 'Nombre requerido' });
      return;
    }

    const precioCosto = Number(row.precio_costo ?? row.precioCosto ?? row['Precio Costo'] ?? 0);
    const precioVenta = Number(row.precio_venta ?? row.precioVenta ?? row['Precio Venta'] ?? 0);
    const stock = Number(row.stock ?? row.Stock ?? row.cantidad ?? 0);
    const stockMinimo = Number(row.stock_minimo ?? row.stockMinimo ?? 5);

    const existing = db.productos.find(
      (p) => p.nombre.toLowerCase() === nombre.toLowerCase()
    );

    const payload: Omit<Producto, 'id' | 'createdAt'> = {
      nombre,
      categoria: (row.categoria as Producto['categoria']) || 'otros',
      subcategoria: String(row.subcategoria || ''),
      marca: String(row.marca || row.Marca || ''),
      unidad: (row.unidad as Producto['unidad']) || 'unidades',
      precioCosto: isNaN(precioCosto) ? 0 : precioCosto,
      precioVenta: isNaN(precioVenta) ? 0 : precioVenta,
      stock: isNaN(stock) ? 0 : stock,
      stockMinimo: isNaN(stockMinimo) ? 5 : stockMinimo,
      descripcion: String(row.descripcion || ''),
      activo: true,
    };

    if (existing) {
      Object.assign(existing, payload);
      result.updated++;
    } else {
      db.productos.push({
        ...payload,
        id: generateId('prod-'),
        createdAt: new Date().toISOString(),
      });
      result.created++;
    }
  });

  addAuditLog(db, 'importar', 'producto', 'excel', userId, `${result.created} creados, ${result.updated} actualizados`);
  await saveDb(db);
  return result;
}

export function productosToExportRows(productos: Producto[]) {
  return productos.map((p) => ({
    nombre: p.nombre,
    categoria: p.categoria,
    subcategoria: p.subcategoria,
    marca: p.marca,
    unidad: p.unidad,
    precio_costo: p.precioCosto,
    precio_venta: p.precioVenta,
    stock: p.stock,
    stock_minimo: p.stockMinimo,
    descripcion: p.descripcion,
  }));
}
