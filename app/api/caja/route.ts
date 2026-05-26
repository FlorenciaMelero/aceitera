import { getApiSession, jsonOk, unauthorized } from '@/lib/api-helpers';
import {
  listCaja,
  createCajaMovimiento,
  getBalance,
  listProveedores,
  createProveedor,
  updateProveedor,
  getSugerenciasCompra,
  listCuentasCorrientes,
} from '@/lib/data-provider';

export async function GET(request: Request) {
  const session = await getApiSession(request as import('next/server').NextRequest);
  if (!session) return unauthorized();

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  if (type === 'balance') {
    return jsonOk(await getBalance((searchParams.get('periodo') as 'dia' | 'semana' | 'mes') || 'dia'));
  }
  if (type === 'proveedores') return jsonOk(await listProveedores());
  if (type === 'sugerencias-compra') return jsonOk(await getSugerenciasCompra());
  if (type === 'cuentas-corrientes') return jsonOk(await listCuentasCorrientes());

  return jsonOk(await listCaja());
}

export async function POST(request: Request) {
  const session = await getApiSession(request as import('next/server').NextRequest);
  if (!session) return unauthorized();

  const body = await request.json();
  if (body.entity === 'proveedor') {
    const prov = await createProveedor(body, session.id);
    return jsonOk(prov, 201);
  }
  const mov = await createCajaMovimiento(body, session.id);
  return jsonOk(mov, 201);
}

export async function PUT(request: Request) {
  const session = await getApiSession(request as import('next/server').NextRequest);
  if (!session) return unauthorized();

  const body = await request.json();
  const prov = await updateProveedor(body.id, body, session.id);
  return jsonOk(prov);
}
