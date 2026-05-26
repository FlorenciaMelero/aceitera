import { getPortalDataByToken } from '@/lib/data-provider';
import { jsonOk } from '@/lib/api-helpers';
import { NextResponse } from 'next/server';

export async function GET(
  _request: Request,
  { params }: { params: { token: string } }
) {
  const data = await getPortalDataByToken(params.token);
  if (!data) {
    return NextResponse.json({ error: 'Enlace no válido o expirado' }, { status: 404 });
  }
  return jsonOk(data);
}
