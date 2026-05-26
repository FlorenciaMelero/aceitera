import { getApiSession, jsonOk, unauthorized } from '@/lib/api-helpers';
import {
  listOrdenes,
  createOrden,
  updateOrdenEstado,
  updateOrdenDetalle,
  getOrden,
  listPlantillasPM,
  savePlantillaPM,
  listServicios,
  listMovimientosStock,
} from '@/lib/data-provider';

export async function GET(request: Request) {
  const session = await getApiSession(request as import('next/server').NextRequest);
  if (!session) return unauthorized();

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  if (type === 'plantillas') return jsonOk(await listPlantillasPM());
  if (type === 'servicios') return jsonOk(await listServicios());
  if (type === 'movimientos') return jsonOk(await listMovimientosStock(searchParams.get('productoId') || undefined));

  const id = searchParams.get('id');
  if (id) return jsonOk(await getOrden(id));

  return jsonOk(await listOrdenes(searchParams.get('estado') as import('@/types').EstadoOT | undefined));
}

export async function POST(request: Request) {
  const session = await getApiSession(request as import('next/server').NextRequest);
  if (!session) return unauthorized();

  const body = await request.json();
  if (body.type === 'plantilla') {
    const plantilla = await savePlantillaPM(body, session.id, body.id);
    return jsonOk(plantilla, 201);
  }

  const result = await createOrden(body, session.id, body.confirmarStock);
  if (!result.ok) return jsonOk(result, 400);
  return jsonOk(result, 201);
}

export async function PATCH(request: Request) {
  const session = await getApiSession(request as import('next/server').NextRequest);
  if (!session) return unauthorized();

  const body = await request.json();
  if (body.fotos !== undefined || body.notasInternas !== undefined) {
    const ot = await updateOrdenDetalle(body.id, { fotos: body.fotos, notasInternas: body.notasInternas }, session.id);
    return jsonOk(ot);
  }
  const ot = await updateOrdenEstado(body.id, body.estado, session.id);
  return jsonOk(ot);
}
