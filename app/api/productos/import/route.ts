import { getApiSession, jsonOk, unauthorized } from '@/lib/api-helpers';
import { importProductos } from '@/lib/data-provider';

export async function POST(request: Request) {
  const session = await getApiSession(request as import('next/server').NextRequest);
  if (!session) return unauthorized();

  const { rows } = await request.json();
  const result = await importProductos(rows, session.id);
  return jsonOk(result);
}
