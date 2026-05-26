import type { PortalData, PortalVehiculo } from '@/types';
import { buildPortalUrl, generatePortalToken } from '@/lib/utils';
import { getServiceStatus } from '@/lib/portal-utils';
import { getSupabaseAdmin } from './client';
import { mapCliente, mapConfiguracion, mapOrdenTrabajo, mapVehiculo } from './mappers';
import type { ClienteRow, ConfiguracionRow, OrdenTrabajoRow, VehiculoRow } from './mappers';

export async function getClienteByPortalToken(token: string) {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from('clientes')
    .select('*')
    .eq('portal_token', token)
    .maybeSingle();

  if (error || !data) return null;
  return mapCliente(data as ClienteRow);
}

export async function generateClientePortalToken(
  clienteId: string,
  userId: string,
  regenerate = false
): Promise<{ token: string; url: string } | null> {
  const sb = getSupabaseAdmin();

  const { data: existing, error: fetchError } = await sb
    .from('clientes')
    .select('*')
    .eq('id', clienteId)
    .maybeSingle();

  if (fetchError || !existing) return null;

  const cliente = mapCliente(existing as ClienteRow);
  if (cliente.portalToken && !regenerate) {
    return { token: cliente.portalToken, url: buildPortalUrl(cliente.portalToken) };
  }

  const token = generatePortalToken();
  const { error: updateError } = await sb
    .from('clientes')
    .update({ portal_token: token })
    .eq('id', clienteId);

  if (updateError) return null;

  await sb.from('audit_log').insert({
    accion: regenerate ? 'regenerar_portal' : 'generar_portal',
    entidad: 'cliente',
    entidad_id: clienteId,
    usuario_id: isUuid(userId) ? userId : null,
    detalle: cliente.nombre,
  });

  return { token, url: buildPortalUrl(token) };
}

export async function getPortalDataByToken(token: string): Promise<PortalData | null> {
  const sb = getSupabaseAdmin();

  const { data: clienteRow, error: clienteError } = await sb
    .from('clientes')
    .select('*')
    .eq('portal_token', token)
    .maybeSingle();

  if (clienteError || !clienteRow) return null;
  const cliente = mapCliente(clienteRow as ClienteRow);

  const { data: vehiculosRows } = await sb
    .from('vehiculos')
    .select('*')
    .eq('cliente_id', cliente.id)
    .order('patente');

  const vehiculosDb = ((vehiculosRows ?? []) as VehiculoRow[]).map(mapVehiculo);
  const vehiculoIds = vehiculosDb.map((v) => v.id);
  const vehiculoMap = Object.fromEntries(vehiculosDb.map((v) => [v.id, v]));

  let ordenesRows: OrdenTrabajoRow[] = [];
  if (vehiculoIds.length > 0) {
    const { data } = await sb
      .from('ordenes_trabajo')
      .select('*')
      .in('vehiculo_id', vehiculoIds)
      .order('fecha', { ascending: false });
    ordenesRows = (data ?? []) as OrdenTrabajoRow[];
  }

  const ordenes = ordenesRows.map(mapOrdenTrabajo);

  const vehiculos: PortalVehiculo[] = vehiculosDb.map((v) => {
    const { status, kmRestantes } = getServiceStatus(v.kmActual, v.kmProximoService);
    const historial = ordenes
      .filter((ot) => ot.vehiculoId === v.id)
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

  const ordenesPendientes = ordenes
    .filter(
      (ot) =>
        ot.clienteId === cliente.id &&
        (ot.estado === 'pendiente' || ot.estado === 'en_proceso')
    )
    .map((ot) => ({
      numero: ot.numero,
      fecha: ot.fecha,
      estado: ot.estado,
      patente: vehiculoMap[ot.vehiculoId]?.patente ?? '-',
    }));

  const { data: configRow } = await sb
    .from('configuracion')
    .select('*')
    .eq('id', 'config-1')
    .maybeSingle();

  const config = configRow
    ? mapConfiguracion(configRow as ConfiguracionRow)
    : {
        id: 'config-1',
        nombreNegocio: 'MP Lubricentro',
        direccion: '',
        telefono: '',
        iva: 21,
        stockMinimoGlobal: 5,
      };

  return {
    nombre: cliente.nombre.split(' ')[0],
    negocio: {
      nombre: config.nombreNegocio,
      telefono: config.telefono,
      direccion: config.direccion,
      logoUrl: config.logoUrl,
    },
    vehiculos,
    ordenesPendientes,
  };
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}
