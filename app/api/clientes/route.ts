import { getApiSession, jsonOk, unauthorized } from '@/lib/api-helpers';
import {
  listClientes,
  createCliente,
  updateCliente,
  deleteCliente,
  listVehiculos,
  createVehiculo,
  updateVehiculo,
  deleteVehiculo,
} from '@/lib/data-provider';

export async function GET(request: Request) {
  const session = await getApiSession(request as import('next/server').NextRequest);
  if (!session) return unauthorized();

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  if (type === 'vehiculos') {
    const vehiculos = await listVehiculos(searchParams.get('clienteId') || undefined);
    return jsonOk(vehiculos);
  }

  const clientes = await listClientes(searchParams.get('search') || undefined);
  return jsonOk(clientes);
}

export async function POST(request: Request) {
  const session = await getApiSession(request as import('next/server').NextRequest);
  if (!session) return unauthorized();

  const body = await request.json();
  if (body.entity === 'vehiculo') {
    const vehiculo = await createVehiculo(body, session.id);
    return jsonOk(vehiculo, 201);
  }
  const cliente = await createCliente(body, session.id);
  return jsonOk(cliente, 201);
}

export async function PUT(request: Request) {
  const session = await getApiSession(request as import('next/server').NextRequest);
  if (!session) return unauthorized();

  const body = await request.json();
  if (body.entity === 'vehiculo') {
    const vehiculo = await updateVehiculo(body.id, body, session.id);
    return jsonOk(vehiculo);
  }
  const cliente = await updateCliente(body.id, body, session.id);
  return jsonOk(cliente);
}

export async function DELETE(request: Request) {
  const session = await getApiSession(request as import('next/server').NextRequest);
  if (!session) return unauthorized();

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id')!;
  const type = searchParams.get('type');

  if (type === 'vehiculo') await deleteVehiculo(id, session.id);
  else await deleteCliente(id, session.id);
  return jsonOk({ ok: true });
}
