import type { Cliente, Configuracion, EstadoOT, OrdenTrabajo, Vehiculo } from '@/types';

export type ClienteRow = {
  id: string;
  nombre: string;
  dni: string | null;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  notas: string | null;
  saldo_cuenta_corriente: number;
  portal_token: string | null;
  created_at: string;
};

export type VehiculoRow = {
  id: string;
  cliente_id: string;
  patente: string;
  marca: string | null;
  modelo: string | null;
  anio: number | null;
  tipo_motor: string | null;
  aceite_recomendado: string | null;
  km_actual: number | null;
  km_proximo_service: number | null;
  created_at: string;
};

export type OrdenTrabajoRow = {
  id: string;
  numero: number;
  cliente_id: string;
  vehiculo_id: string;
  tecnico_id: string | null;
  fecha: string;
  estado: EstadoOT;
  km_ingreso: number | null;
  observaciones: string | null;
  diagnostico: string | null;
  total: number;
  fotos: string[] | null;
  notas_internas: string | null;
  created_at: string;
};

export type ConfiguracionRow = {
  id: string;
  nombre_negocio: string;
  logo_url: string | null;
  direccion: string;
  telefono: string;
  cuit: string | null;
  iva: number;
  stock_minimo_global: number;
};

export function mapCliente(row: ClienteRow): Cliente {
  return {
    id: row.id,
    nombre: row.nombre,
    dni: row.dni ?? undefined,
    telefono: row.telefono ?? undefined,
    email: row.email ?? undefined,
    direccion: row.direccion ?? undefined,
    notas: row.notas ?? undefined,
    saldoCuentaCorriente: Number(row.saldo_cuenta_corriente ?? 0),
    portalToken: row.portal_token ?? undefined,
    createdAt: row.created_at,
  };
}

export function mapVehiculo(row: VehiculoRow): Vehiculo {
  return {
    id: row.id,
    clienteId: row.cliente_id,
    patente: row.patente,
    marca: row.marca ?? undefined,
    modelo: row.modelo ?? undefined,
    anio: row.anio ?? undefined,
    tipoMotor: row.tipo_motor ?? undefined,
    aceiteRecomendado: row.aceite_recomendado ?? undefined,
    kmActual: row.km_actual ?? undefined,
    kmProximoService: row.km_proximo_service ?? undefined,
    createdAt: row.created_at,
  };
}

export function mapOrdenTrabajo(row: OrdenTrabajoRow): OrdenTrabajo {
  return {
    id: row.id,
    numero: row.numero,
    clienteId: row.cliente_id,
    vehiculoId: row.vehiculo_id,
    tecnicoId: row.tecnico_id ?? undefined,
    fecha: row.fecha,
    estado: row.estado,
    kmIngreso: row.km_ingreso ?? undefined,
    observaciones: row.observaciones ?? undefined,
    diagnostico: row.diagnostico ?? undefined,
    total: Number(row.total),
    fotos: row.fotos ?? undefined,
    notasInternas: row.notas_internas ?? undefined,
    createdAt: row.created_at,
  };
}

export function mapConfiguracion(row: ConfiguracionRow): Configuracion {
  return {
    id: row.id,
    nombreNegocio: row.nombre_negocio,
    logoUrl: row.logo_url ?? undefined,
    direccion: row.direccion,
    telefono: row.telefono,
    cuit: row.cuit ?? undefined,
    iva: Number(row.iva),
    stockMinimoGlobal: row.stock_minimo_global,
  };
}

export function clienteToRow(data: Partial<Cliente>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (data.nombre !== undefined) row.nombre = data.nombre;
  if (data.dni !== undefined) row.dni = data.dni || null;
  if (data.telefono !== undefined) row.telefono = data.telefono || null;
  if (data.email !== undefined) row.email = data.email || null;
  if (data.direccion !== undefined) row.direccion = data.direccion || null;
  if (data.notas !== undefined) row.notas = data.notas || null;
  if (data.portalToken !== undefined) row.portal_token = data.portalToken || null;
  if (data.saldoCuentaCorriente !== undefined) row.saldo_cuenta_corriente = data.saldoCuentaCorriente;
  return row;
}

export function vehiculoToRow(data: Partial<Vehiculo>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (data.clienteId !== undefined) row.cliente_id = data.clienteId;
  if (data.patente !== undefined) row.patente = data.patente.toUpperCase();
  if (data.marca !== undefined) row.marca = data.marca || null;
  if (data.modelo !== undefined) row.modelo = data.modelo || null;
  if (data.anio !== undefined) row.anio = data.anio;
  if (data.tipoMotor !== undefined) row.tipo_motor = data.tipoMotor || null;
  if (data.aceiteRecomendado !== undefined) row.aceite_recomendado = data.aceiteRecomendado || null;
  if (data.kmActual !== undefined) row.km_actual = data.kmActual;
  if (data.kmProximoService !== undefined) row.km_proximo_service = data.kmProximoService;
  return row;
}
