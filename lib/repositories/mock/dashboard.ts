import type { DashboardKPIs } from '@/types';
import { getDb } from './store';
import { startOfMonth, startOfDay, isAfter, isBefore, addDays } from 'date-fns';

export async function getDashboardKPIs(): Promise<DashboardKPIs> {
  const db = await getDb();
  const now = new Date();
  const monthStart = startOfMonth(now);
  const todayStart = startOfDay(now);

  const otsMes = db.ordenesTrabajo.filter(
    (ot) => isAfter(new Date(ot.fecha), monthStart)
  ).length;

  const ingresosMes = db.caja
    .filter((c) => c.tipo === 'ingreso' && isAfter(new Date(c.fecha), monthStart))
    .reduce((s, c) => s + c.monto, 0);

  const stockBajo = db.productos.filter((p) => p.stock <= p.stockMinimo && p.activo).length;

  const clientesHoy = new Set(
    db.ordenesTrabajo
      .filter((ot) => isAfter(new Date(ot.fecha), todayStart))
      .map((ot) => ot.clienteId)
  ).size;

  const porVencer = db.lotes.filter((l) => {
    if (!l.vencimiento) return false;
    const venc = new Date(l.vencimiento);
    return isBefore(venc, addDays(now, 30)) && isAfter(venc, now);
  }).length;

  return { otsMes, ingresosMes, stockBajo, clientesHoy, porVencer };
}

export async function getDashboardCharts() {
  const db = await getDb();
  const now = new Date();
  const monthStart = startOfMonth(now);

  const ingresosDiarios: Record<string, number> = {};
  db.caja
    .filter((c) => c.tipo === 'ingreso' && isAfter(new Date(c.fecha), monthStart))
    .forEach((c) => {
      const day = c.fecha.slice(0, 10);
      ingresosDiarios[day] = (ingresosDiarios[day] || 0) + c.monto;
    });

  const serviciosCount: Record<string, number> = {};
  db.otServicios.forEach((os) => {
    const srv = db.servicios.find((s) => s.id === os.servicioId);
    const name = srv?.nombre || 'Otro';
    serviciosCount[name] = (serviciosCount[name] || 0) + 1;
  });

  const productosUsados: Record<string, number> = {};
  db.otItems.forEach((oi) => {
    const prod = db.productos.find((p) => p.id === oi.productoId);
    const name = prod?.nombre || 'Otro';
    productosUsados[name] = (productosUsados[name] || 0) + oi.cantidad;
  });

  const stockBajo = db.productos.filter((p) => p.stock <= p.stockMinimo).length;
  const stockNormal = db.productos.filter(
    (p) => p.stock > p.stockMinimo && p.stock <= p.stockMinimo * 3
  ).length;
  const stockExcesivo = db.productos.filter((p) => p.stock > p.stockMinimo * 3).length;

  const otEstados: Record<string, number> = {};
  db.ordenesTrabajo.forEach((ot) => {
    otEstados[ot.estado] = (otEstados[ot.estado] || 0) + 1;
  });

  const clientesPorMes: Record<string, number> = {};
  db.clientes.forEach((c) => {
    const mes = c.createdAt.slice(0, 7);
    clientesPorMes[mes] = (clientesPorMes[mes] || 0) + 1;
  });

  const topProductos = Object.entries(productosUsados)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return {
    ingresosDiarios: Object.entries(ingresosDiarios).map(([fecha, monto]) => ({ fecha, monto })),
    serviciosTop: Object.entries(serviciosCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([nombre, cantidad]) => ({ nombre, cantidad })),
    productosTop: Object.entries(productosUsados)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([nombre, cantidad]) => ({ nombre, cantidad })),
    stockEstado: [
      { name: 'Bajo', value: stockBajo },
      { name: 'Normal', value: stockNormal },
      { name: 'Excesivo', value: stockExcesivo },
    ],
    otEstados: Object.entries(otEstados).map(([estado, cantidad]) => ({ estado, cantidad })),
    clientesPorMes: Object.entries(clientesPorMes).map(([mes, cantidad]) => ({ mes, cantidad })),
    topProductosEvolucion: topProductos.map(([nombre]) => ({ nombre })),
    gananciaVsCosto: db.ordenesTrabajo.slice(0, 6).map((ot) => {
      const items = db.otItems.filter((i) => i.otId === ot.id);
      const costo = items.reduce((s, i) => {
        const p = db.productos.find((pr) => pr.id === i.productoId);
        return s + (p?.precioCosto || 0) * i.cantidad;
      }, 0);
      return { ot: `#${ot.numero}`, ingreso: ot.total, costo };
    }),
  };
}

export async function globalSearch(q: string) {
  const db = await getDb();
  const query = q.toLowerCase();
  if (!query) return { clientes: [], productos: [], ordenes: [] };

  return {
    clientes: db.clientes
      .filter((c) => c.nombre.toLowerCase().includes(query) || c.dni?.includes(query))
      .slice(0, 5),
    productos: db.productos
      .filter((p) => p.nombre.toLowerCase().includes(query))
      .slice(0, 5),
    ordenes: db.ordenesTrabajo
      .filter((ot) => String(ot.numero).includes(query))
      .slice(0, 5),
  };
}
