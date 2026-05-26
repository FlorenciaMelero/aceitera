import type { PortalData, PortalVehiculo } from '@/types';
import { buildPortalUrl, generatePortalToken } from '@/lib/utils';
import { getServiceStatus } from '@/lib/portal-utils';
import { addAuditLog, getDb, saveDb } from './store';

export async function getClienteByPortalToken(token: string) {
  const db = await getDb();
  return db.clientes.find((c) => c.portalToken === token) ?? null;
}

export async function generateClientePortalToken(
  clienteId: string,
  userId: string,
  regenerate = false
): Promise<{ token: string; url: string } | null> {
  const db = await getDb();
  const idx = db.clientes.findIndex((c) => c.id === clienteId);
  if (idx === -1) return null;

  const cliente = db.clientes[idx];
  if (cliente.portalToken && !regenerate) {
    return { token: cliente.portalToken, url: buildPortalUrl(cliente.portalToken) };
  }

  const token = generatePortalToken();
  db.clientes[idx] = { ...cliente, portalToken: token };
  addAuditLog(
    db,
    regenerate ? 'regenerar_portal' : 'generar_portal',
    'cliente',
    clienteId,
    userId,
    cliente.nombre
  );
  await saveDb(db);
  return { token, url: buildPortalUrl(token) };
}

export async function getPortalDataByToken(token: string): Promise<PortalData | null> {
  const db = await getDb();
  const cliente = db.clientes.find((c) => c.portalToken === token);
  if (!cliente) return null;

  const vehiculosDb = db.vehiculos.filter((v) => v.clienteId === cliente.id);
  const vehiculoMap = Object.fromEntries(vehiculosDb.map((v) => [v.id, v]));

  const vehiculos: PortalVehiculo[] = vehiculosDb.map((v) => {
    const { status, kmRestantes } = getServiceStatus(v.kmActual, v.kmProximoService);
    const historial = db.ordenesTrabajo
      .filter((ot) => ot.vehiculoId === v.id)
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      .slice(0, 5)
      .map((ot) => ({
        fecha: ot.fecha,
        numero: ot.numero,
        estado: ot.estado,
        kmIngreso: ot.kmIngreso,
      }));

    return {
      patente: v.patente,
      marca: v.marca,
      modelo: v.modelo,
      anio: v.anio,
      aceiteRecomendado: v.aceiteRecomendado,
      kmActual: v.kmActual,
      kmProximoService: v.kmProximoService,
      kmRestantes,
      serviceStatus: status,
      historial,
    };
  });

  const ordenesPendientes = db.ordenesTrabajo
    .filter(
      (ot) =>
        ot.clienteId === cliente.id &&
        (ot.estado === 'pendiente' || ot.estado === 'en_proceso')
    )
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .map((ot) => ({
      numero: ot.numero,
      fecha: ot.fecha,
      estado: ot.estado,
      patente: vehiculoMap[ot.vehiculoId]?.patente ?? '-',
    }));

  return {
    nombre: cliente.nombre.split(' ')[0],
    negocio: {
      nombre: db.configuracion.nombreNegocio,
      telefono: db.configuracion.telefono,
      direccion: db.configuracion.direccion,
      logoUrl: db.configuracion.logoUrl,
    },
    vehiculos,
    ordenesPendientes,
  };
}
