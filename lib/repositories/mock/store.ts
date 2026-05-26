import { promises as fs } from 'fs';
import path from 'path';
import type { MockDatabase } from '@/types';
import { generateId, hashPasswordSync } from '@/lib/utils';

const DB_PATH = path.join(process.cwd(), 'data', 'store.json');

function createSeed(): MockDatabase {
  const adminId = generateId('usr-');
  const provId = generateId('prov-');
  const prodAceiteId = generateId('prod-');
  const prodFiltroId = generateId('prod-');
  const clienteId = generateId('cli-');
  const cliente2Id = generateId('cli-');
  const vehiculoId = generateId('veh-');
  const servicioId = generateId('srv-');
  const plantillaId = generateId('pm-');
  const otDemoId = generateId('ot-');
  const demoPortalToken = 'demo-juan-perez-portal-token-prueba1234567890abcd';

  return {
    usuarios: [
      {
        id: adminId,
        email: 'admin@lubricentro.local',
        nombre: 'Administrador',
        rol: 'admin',
        passwordHash: hashPasswordSync('Admin123!'),
        activo: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: generateId('usr-'),
        email: 'tecnico@lubricentro.local',
        nombre: 'Juan Técnico',
        rol: 'tecnico',
        passwordHash: hashPasswordSync('Tecnico123!'),
        activo: true,
        createdAt: new Date().toISOString(),
      },
    ],
    productos: [
      {
        id: prodAceiteId,
        nombre: 'Aceite Castrol 10W40',
        categoria: 'aceites',
        subcategoria: 'Mineral',
        marca: 'Castrol',
        unidad: 'litros',
        precioCosto: 8500,
        precioVenta: 12000,
        stock: 48,
        stockMinimo: 12,
        descripcion: 'Aceite mineral 10W40 4L',
        proveedorId: provId,
        activo: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: prodFiltroId,
        nombre: 'Filtro de aceite Mann W712/75',
        categoria: 'filtros',
        marca: 'Mann',
        unidad: 'unidades',
        precioCosto: 3200,
        precioVenta: 5500,
        stock: 8,
        stockMinimo: 10,
        descripcion: 'Filtro aceite universal',
        proveedorId: provId,
        activo: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: generateId('prod-'),
        nombre: 'Líquido refrigerante rosa 1L',
        categoria: 'liquidos',
        marca: 'Total',
        unidad: 'litros',
        precioCosto: 1800,
        precioVenta: 3200,
        stock: 24,
        stockMinimo: 8,
        activo: true,
        createdAt: new Date().toISOString(),
      },
    ],
    lotes: [
      {
        id: generateId('lote-'),
        productoId: prodAceiteId,
        cantidad: 48,
        vencimiento: '2027-06-01',
        fechaIngreso: new Date().toISOString(),
      },
    ],
    clientes: [
      {
        id: clienteId,
        nombre: 'Juan Pérez',
        dni: '30123456',
        telefono: '3511234567',
        email: 'juan@email.com',
        direccion: 'Córdoba',
        notas: '',
        saldoCuentaCorriente: 0,
        portalToken: demoPortalToken,
        createdAt: new Date().toISOString(),
      },
      {
        id: cliente2Id,
        nombre: 'María López',
        dni: '28987654',
        telefono: '3517654321',
        saldoCuentaCorriente: 15000,
        createdAt: new Date().toISOString(),
      },
    ],
    vehiculos: [
      {
        id: vehiculoId,
        clienteId,
        patente: 'ABC123',
        marca: 'Toyota',
        modelo: 'Corolla',
        anio: 2018,
        tipoMotor: '1.8 Nafta',
        aceiteRecomendado: '10W40',
        kmActual: 56000,
        kmProximoService: 61000,
        createdAt: new Date().toISOString(),
      },
      {
        id: generateId('veh-'),
        clienteId: cliente2Id,
        patente: 'DEF456',
        marca: 'Volkswagen',
        modelo: 'Amarok',
        anio: 2021,
        kmActual: 82000,
        kmProximoService: 87000,
        createdAt: new Date().toISOString(),
      },
    ],
    servicios: [
      {
        id: servicioId,
        nombre: 'Cambio de aceite 4L',
        descripcion: 'Cambio de aceite y filtro',
        precioBase: 25000,
        activo: true,
      },
      {
        id: generateId('srv-'),
        nombre: 'Service completo',
        descripcion: 'Service general del vehículo',
        precioBase: 45000,
        activo: true,
      },
    ],
    plantillasPM: [
      {
        id: plantillaId,
        nombre: 'Cambio de aceite 4L',
        descripcion: 'Plantilla estándar cambio aceite + filtro',
        servicioId,
        items: [
          { id: generateId('pmi-'), plantillaId, productoId: prodAceiteId, cantidad: 4 },
          { id: generateId('pmi-'), plantillaId, productoId: prodFiltroId, cantidad: 1 },
        ],
      },
    ],
    ordenesTrabajo: [
      {
        id: otDemoId,
        numero: 1,
        clienteId,
        vehiculoId,
        fecha: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        estado: 'entregado',
        kmIngreso: 51000,
        observaciones: 'Cambio de aceite y filtro',
        total: 25000,
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    otItems: [],
    otServicios: [],
    movimientosStock: [],
    proveedores: [
      {
        id: provId,
        razonSocial: 'Distribuidora Aceites SA',
        cuit: '30-71234567-8',
        contacto: 'Carlos Repuestos',
        telefono: '3514445566',
        email: 'ventas@aceites.com',
        condicionPago: '30 días',
        productoIds: [prodAceiteId, prodFiltroId],
      },
    ],
    ordenesCompra: [],
    caja: [],
    combos: [
      {
        id: generateId('combo-'),
        nombre: 'Pack cambio aceite 4L',
        descripcion: 'Aceite Castrol 4L + filtro Mann',
        productoIds: [prodAceiteId, prodFiltroId],
        precio: 52000,
      },
    ],
    categoriasMarcas: [
      { id: generateId('cat-'), tipo: 'categoria', nombre: 'Aceites' },
      { id: generateId('cat-'), tipo: 'categoria', nombre: 'Filtros' },
      { id: generateId('mar-'), tipo: 'marca', nombre: 'Castrol' },
      { id: generateId('mar-'), tipo: 'marca', nombre: 'Mann' },
    ],
    auditLog: [],
    configuracion: {
      id: 'config-1',
      nombreNegocio: 'MP Lubricentro',
      direccion: 'Eduardo Sosa 2188, Barrio Santa Isabel 1ª Sección, Córdoba',
      telefono: '351 207 9348',
      cuit: '',
      iva: 21,
      stockMinimoGlobal: 5,
    },
    otCounter: 1,
  };
}

let memoryStore: MockDatabase | null = null;

export async function getDb(): Promise<MockDatabase> {
  if (memoryStore) return memoryStore;

  try {
    await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
    const raw = await fs.readFile(DB_PATH, 'utf-8');
    memoryStore = JSON.parse(raw) as MockDatabase;
    return memoryStore;
  } catch {
    memoryStore = createSeed();
    await saveDb(memoryStore);
    return memoryStore;
  }
}

export async function saveDb(db: MockDatabase): Promise<void> {
  memoryStore = db;
  await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
}

export async function resetDb(): Promise<MockDatabase> {
  memoryStore = createSeed();
  await saveDb(memoryStore);
  return memoryStore;
}

export function addAuditLog(
  db: MockDatabase,
  accion: string,
  entidad: string,
  entidadId: string,
  usuarioId: string,
  detalle?: string
) {
  db.auditLog.unshift({
    id: generateId('log-'),
    accion,
    entidad,
    entidadId,
    usuarioId,
    fecha: new Date().toISOString(),
    detalle,
  });
  if (db.auditLog.length > 500) db.auditLog.length = 500;
}
