import type {
  EstadoOT,
  OrdenTrabajo,
  OTItem,
  OTServicio,
  PlantillaPM,
} from '@/types';
import { addAuditLog, getDb, saveDb } from './store';
import { deductStock } from './products';
import { generateId } from '@/lib/utils';

export async function listOrdenes(estado?: EstadoOT): Promise<OrdenTrabajo[]> {
  const db = await getDb();
  let items = [...db.ordenesTrabajo];
  if (estado) items = items.filter((ot) => ot.estado === estado);
  return items.sort((a, b) => b.numero - a.numero);
}

export async function getOrden(id: string) {
  const db = await getDb();
  const ot = db.ordenesTrabajo.find((o) => o.id === id);
  if (!ot) return null;
  return {
    ...ot,
    items: db.otItems.filter((i) => i.otId === id),
    servicios: db.otServicios.filter((s) => s.otId === id),
  };
}

export async function createOrden(
  data: {
    clienteId: string;
    vehiculoId: string;
    tecnicoId?: string;
    kmIngreso?: number;
    observaciones?: string;
    fotos?: string[];
    notasInternas?: string;
    items: { productoId: string; cantidad: number; precioUnitario: number }[];
    servicios: { servicioId: string; precio: number }[];
    plantillaId?: string;
  },
  userId: string,
  confirmarStock = false
): Promise<{ ok: boolean; ot?: OrdenTrabajo; errors?: string[] }> {
  const db = await getDb();

  if (data.plantillaId) {
    const plantilla = db.plantillasPM.find((p) => p.id === data.plantillaId);
    if (plantilla) {
      for (const pi of plantilla.items) {
        const prod = db.productos.find((p) => p.id === pi.productoId);
        if (prod && !data.items.find((i) => i.productoId === pi.productoId)) {
          data.items.push({
            productoId: pi.productoId,
            cantidad: pi.cantidad,
            precioUnitario: prod.precioVenta,
          });
        }
      }
    }
  }

  const stockErrors: string[] = [];
  for (const item of data.items) {
    const prod = db.productos.find((p) => p.id === item.productoId);
    if (prod && prod.stock < item.cantidad) {
      stockErrors.push(`${prod.nombre}: disponible ${prod.stock}, necesario ${item.cantidad}`);
    }
  }

  if (stockErrors.length && !confirmarStock) {
    return { ok: false, errors: stockErrors };
  }

  const totalItems = data.items.reduce((s, i) => s + i.cantidad * i.precioUnitario, 0);
  const totalServicios = data.servicios.reduce((s, i) => s + i.precio, 0);
  const numero = db.otCounter++;

  const ot: OrdenTrabajo = {
    id: generateId('ot-'),
    numero,
    clienteId: data.clienteId,
    vehiculoId: data.vehiculoId,
    tecnicoId: data.tecnicoId,
    fecha: new Date().toISOString(),
    estado: 'pendiente',
    kmIngreso: data.kmIngreso,
    observaciones: data.observaciones,
    fotos: data.fotos?.filter(Boolean),
    notasInternas: data.notasInternas,
    total: totalItems + totalServicios,
    createdAt: new Date().toISOString(),
  };

  db.ordenesTrabajo.push(ot);

  for (const item of data.items) {
    const otItem: OTItem = {
      id: generateId('oti-'),
      otId: ot.id,
      ...item,
    };
    db.otItems.push(otItem);
    await deductStock(db, item.productoId, item.cantidad, `OT #${numero}`, ot.id);
  }

  for (const srv of data.servicios) {
    db.otServicios.push({
      id: generateId('ots-'),
      otId: ot.id,
      ...srv,
    });
  }

  const vehiculo = db.vehiculos.find((v) => v.id === data.vehiculoId);
  if (vehiculo && data.kmIngreso) {
    vehiculo.kmActual = data.kmIngreso;
  }

  addAuditLog(db, 'crear', 'orden_trabajo', ot.id, userId, `OT #${numero}`);
  await saveDb(db);
  return { ok: true, ot };
}

export async function updateOrdenEstado(
  id: string,
  estado: EstadoOT,
  userId: string
): Promise<OrdenTrabajo | null> {
  const db = await getDb();
  const ot = db.ordenesTrabajo.find((o) => o.id === id);
  if (!ot) return null;
  ot.estado = estado;

  if (estado === 'entregado') {
    db.caja.push({
      id: generateId('caja-'),
      fecha: new Date().toISOString(),
      tipo: 'ingreso',
      monto: ot.total,
      metodoPago: 'efectivo',
      descripcion: `Cobro OT #${ot.numero}`,
      otId: ot.id,
      clienteId: ot.clienteId,
    });
  }

  addAuditLog(db, 'actualizar_estado', 'orden_trabajo', id, userId, estado);
  await saveDb(db);
  return ot;
}

export async function listPlantillasPM(): Promise<PlantillaPM[]> {
  const db = await getDb();
  return db.plantillasPM;
}

export async function savePlantillaPM(
  data: Omit<PlantillaPM, 'id' | 'items'> & { items: Omit<PlantillaPM['items'][0], 'id' | 'plantillaId'>[] },
  userId: string,
  id?: string
): Promise<PlantillaPM> {
  const db = await getDb();
  const plantillaId = id || generateId('pm-');

  const plantilla: PlantillaPM = {
    id: plantillaId,
    nombre: data.nombre,
    descripcion: data.descripcion,
    servicioId: data.servicioId,
    items: data.items.map((item) => ({
      id: generateId('pmi-'),
      plantillaId,
      productoId: item.productoId,
      cantidad: item.cantidad,
    })),
  };

  const idx = db.plantillasPM.findIndex((p) => p.id === plantillaId);
  if (idx >= 0) db.plantillasPM[idx] = plantilla;
  else db.plantillasPM.push(plantilla);

  addAuditLog(db, id ? 'actualizar' : 'crear', 'plantilla_pm', plantillaId, userId);
  await saveDb(db);
  return plantilla;
}

export async function listServicios() {
  const db = await getDb();
  return db.servicios.filter((s) => s.activo);
}

export async function updateOrdenDetalle(
  id: string,
  data: { fotos?: string[]; notasInternas?: string },
  userId: string
): Promise<OrdenTrabajo | null> {
  const db = await getDb();
  const ot = db.ordenesTrabajo.find((o) => o.id === id);
  if (!ot) return null;
  if (data.fotos !== undefined) ot.fotos = data.fotos.filter(Boolean);
  if (data.notasInternas !== undefined) ot.notasInternas = data.notasInternas;
  addAuditLog(db, 'actualizar', 'orden_trabajo', id, userId, 'fotos/notas');
  await saveDb(db);
  return ot;
}

export async function listMovimientosStock(productoId?: string) {
  const db = await getDb();
  let items = [...db.movimientosStock];
  if (productoId) items = items.filter((m) => m.productoId === productoId);
  return items;
}
