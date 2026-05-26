export type Rol = 'admin' | 'tecnico' | 'user';

export type CategoriaProducto =
  | 'aceites'
  | 'filtros'
  | 'liquidos'
  | 'aditivos'
  | 'repuestos'
  | 'otros';

export type UnidadMedida =
  | 'litros'
  | 'latas'
  | 'baldes'
  | 'galones'
  | 'unidades'
  | 'kg';

export type EstadoOT = 'pendiente' | 'en_proceso' | 'terminado' | 'entregado';

export type MetodoPago = 'efectivo' | 'transferencia' | 'tarjeta' | 'cuenta_corriente';

export type TipoMovimientoStock = 'entrada' | 'salida' | 'ajuste';

export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  rol: Rol;
  passwordHash: string;
  activo: boolean;
  createdAt: string;
}

export interface Producto {
  id: string;
  nombre: string;
  categoria: CategoriaProducto;
  subcategoria?: string;
  marca?: string;
  unidad: UnidadMedida;
  precioCosto: number;
  precioVenta: number;
  stock: number;
  stockMinimo: number;
  descripcion?: string;
  asignacion?: string;
  vencimiento?: string;
  proveedorId?: string;
  codigoBarras?: string;
  imagenUrl?: string;
  comboIds?: string[];
  activo: boolean;
  createdAt: string;
}

export interface Lote {
  id: string;
  productoId: string;
  cantidad: number;
  vencimiento?: string;
  fechaIngreso: string;
}

export interface Cliente {
  id: string;
  nombre: string;
  dni?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  notas?: string;
  saldoCuentaCorriente: number;
  portalToken?: string;
  createdAt: string;
}

export type PortalServiceStatus = 'ok' | 'proximo' | 'vencido';

export interface PortalHistorialItem {
  fecha: string;
  numero: number;
  estado: EstadoOT;
  kmIngreso?: number;
}

export interface PortalOrdenPendiente {
  numero: number;
  fecha: string;
  estado: EstadoOT;
  patente: string;
}

export interface PortalVehiculo {
  patente: string;
  marca?: string;
  modelo?: string;
  anio?: number;
  aceiteRecomendado?: string;
  kmActual?: number;
  kmProximoService?: number;
  kmRestantes?: number;
  serviceStatus: PortalServiceStatus;
  historial: PortalHistorialItem[];
}

export interface PortalData {
  nombre: string;
  negocio: {
    nombre: string;
    telefono: string;
    direccion: string;
    logoUrl?: string;
  };
  vehiculos: PortalVehiculo[];
  ordenesPendientes: PortalOrdenPendiente[];
}

export interface Vehiculo {
  id: string;
  clienteId: string;
  patente: string;
  marca?: string;
  modelo?: string;
  anio?: number;
  tipoMotor?: string;
  aceiteRecomendado?: string;
  kmActual?: number;
  kmProximoService?: number;
  createdAt: string;
}

export interface Servicio {
  id: string;
  nombre: string;
  descripcion?: string;
  precioBase: number;
  activo: boolean;
}

export interface PlantillaPM {
  id: string;
  nombre: string;
  descripcion?: string;
  servicioId?: string;
  items: PlantillaPMItem[];
}

export interface PlantillaPMItem {
  id: string;
  plantillaId: string;
  productoId: string;
  cantidad: number;
}

export interface OrdenTrabajo {
  id: string;
  numero: number;
  clienteId: string;
  vehiculoId: string;
  tecnicoId?: string;
  fecha: string;
  estado: EstadoOT;
  kmIngreso?: number;
  observaciones?: string;
  diagnostico?: string;
  total: number;
  fotos?: string[];
  notasInternas?: string;
  createdAt: string;
}

export interface OTItem {
  id: string;
  otId: string;
  productoId: string;
  cantidad: number;
  precioUnitario: number;
}

export interface OTServicio {
  id: string;
  otId: string;
  servicioId: string;
  precio: number;
}

export interface MovimientoStock {
  id: string;
  productoId: string;
  tipo: TipoMovimientoStock;
  cantidad: number;
  motivo: string;
  otId?: string;
  fecha: string;
}

export interface Proveedor {
  id: string;
  razonSocial: string;
  cuit?: string;
  contacto?: string;
  telefono?: string;
  email?: string;
  condicionPago?: string;
  productoIds?: string[];
}

export interface OrdenCompra {
  id: string;
  proveedorId: string;
  fecha: string;
  estado: 'borrador' | 'enviada' | 'recibida';
  items: { productoId: string; cantidad: number; precioUnitario: number }[];
  total: number;
}

export interface CajaMovimiento {
  id: string;
  fecha: string;
  tipo: 'ingreso' | 'egreso';
  monto: number;
  metodoPago?: MetodoPago;
  descripcion: string;
  otId?: string;
  clienteId?: string;
}

export interface Combo {
  id: string;
  nombre: string;
  descripcion?: string;
  productoIds: string[];
  precio: number;
}

export interface CategoriaMarca {
  id: string;
  tipo: 'categoria' | 'marca';
  nombre: string;
}

export interface AuditLog {
  id: string;
  accion: string;
  entidad: string;
  entidadId: string;
  usuarioId: string;
  fecha: string;
  detalle?: string;
}

export interface Configuracion {
  id: string;
  nombreNegocio: string;
  logoUrl?: string;
  direccion: string;
  telefono: string;
  cuit?: string;
  iva: number;
  stockMinimoGlobal: number;
}

export interface MockDatabase {
  usuarios: Usuario[];
  productos: Producto[];
  lotes: Lote[];
  clientes: Cliente[];
  vehiculos: Vehiculo[];
  servicios: Servicio[];
  plantillasPM: PlantillaPM[];
  ordenesTrabajo: OrdenTrabajo[];
  otItems: OTItem[];
  otServicios: OTServicio[];
  movimientosStock: MovimientoStock[];
  proveedores: Proveedor[];
  ordenesCompra: OrdenCompra[];
  caja: CajaMovimiento[];
  combos: Combo[];
  categoriasMarcas: CategoriaMarca[];
  auditLog: AuditLog[];
  configuracion: Configuracion;
  otCounter: number;
}

export interface ImportRowError {
  row: number;
  field: string;
  message: string;
}

export interface ImportResult {
  created: number;
  updated: number;
  errors: ImportRowError[];
}

export interface StockStatus {
  level: 'bajo' | 'normal' | 'excesivo';
  label: string;
}

export interface DashboardKPIs {
  otsMes: number;
  ingresosMes: number;
  stockBajo: number;
  clientesHoy: number;
  porVencer: number;
}

export interface SessionUser {
  id: string;
  email: string;
  nombre: string;
  rol: Rol;
}
