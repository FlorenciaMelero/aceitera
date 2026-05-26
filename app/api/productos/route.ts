import { getApiSession, jsonOk, unauthorized } from '@/lib/api-helpers';
import { listProductos, createProducto, updateProducto, deleteProducto } from '@/lib/data-provider';

export async function GET(request: Request) {
  const session = await getApiSession(request as import('next/server').NextRequest);
  if (!session) return unauthorized();

  const { searchParams } = new URL(request.url);
  const productos = await listProductos({
    search: searchParams.get('search') || undefined,
    categoria: searchParams.get('categoria') || undefined,
    stockLevel: (searchParams.get('stockLevel') as 'bajo' | 'normal' | 'excesivo') || undefined,
  });
  return jsonOk(productos);
}

export async function POST(request: Request) {
  const session = await getApiSession(request as import('next/server').NextRequest);
  if (!session) return unauthorized();

  const body = await request.json();
  const producto = await createProducto(body, session.id);
  return jsonOk(producto, 201);
}

export async function PUT(request: Request) {
  const session = await getApiSession(request as import('next/server').NextRequest);
  if (!session) return unauthorized();

  const body = await request.json();
  const producto = await updateProducto(body.id, body, session.id);
  return jsonOk(producto);
}

export async function DELETE(request: Request) {
  const session = await getApiSession(request as import('next/server').NextRequest);
  if (!session) return unauthorized();

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return jsonOk({ error: 'ID requerido' }, 400);
  await deleteProducto(id, session.id);
  return jsonOk({ ok: true });
}
