import { getApiSession, jsonOk, unauthorized } from '@/lib/api-helpers';
import { generateClientePortalToken } from '@/lib/data-provider';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const session = await getApiSession(request);
  if (!session) return unauthorized();

  const body = await request.json();
  const { clienteId, regenerate } = body as { clienteId?: string; regenerate?: boolean };

  if (!clienteId) {
    return NextResponse.json({ error: 'clienteId requerido' }, { status: 400 });
  }

  const result = await generateClientePortalToken(clienteId, session.id, !!regenerate);
  if (!result) {
    return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
  }

  return jsonOk(result);
}
