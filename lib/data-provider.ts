/**
 * Data provider — uses Supabase when env vars are set, otherwise mock JSON.
 */

import { isSupabaseConfigured } from './repositories/supabase/client';

import * as mockStore from './repositories/mock/store';
import * as mockProducts from './repositories/mock/products';
import * as mockClientes from './repositories/mock/clientes';
import * as mockOrdenes from './repositories/mock/ordenes';
import * as mockDashboard from './repositories/mock/dashboard';
import * as mockCaja from './repositories/mock/caja';
import * as mockPortal from './repositories/mock/portal';

import * as sbClientes from './repositories/supabase/clientes';
import * as sbPortal from './repositories/supabase/portal';

const useSupabase = isSupabaseConfigured();

// Mock-only (Phase 7 partial — portal + clientes on Supabase first)
export const getDb = mockStore.getDb;
export const saveDb = mockStore.saveDb;
export const resetDb = mockStore.resetDb;
export const addAuditLog = mockStore.addAuditLog;

export * from './repositories/mock/products';
export * from './repositories/mock/ordenes';
export * from './repositories/mock/dashboard';
export * from './repositories/mock/caja';

// Clientes + vehículos + portal → Supabase when configured
const clientes = useSupabase ? sbClientes : mockClientes;
export const listClientes = clientes.listClientes;
export const getCliente = clientes.getCliente;
export const createCliente = clientes.createCliente;
export const updateCliente = clientes.updateCliente;
export const deleteCliente = clientes.deleteCliente;
export const listVehiculos = clientes.listVehiculos;
export const createVehiculo = clientes.createVehiculo;
export const updateVehiculo = clientes.updateVehiculo;
export const deleteVehiculo = clientes.deleteVehiculo;
export const getHistorialVehiculo = clientes.getHistorialVehiculo;
export const getAlertasService = clientes.getAlertasService;

const portal = useSupabase ? sbPortal : mockPortal;
export const getClienteByPortalToken = portal.getClienteByPortalToken;
export const generateClientePortalToken = portal.generateClientePortalToken;
export const getPortalDataByToken = portal.getPortalDataByToken;

export { isSupabaseConfigured, supabaseRepositoriesReady } from './repositories/supabase/client';
