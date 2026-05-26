import { getApiSession, jsonOk, unauthorized } from '@/lib/api-helpers';

export async function GET(request: Request) {
  const session = await getApiSession(request as import('next/server').NextRequest);
  if (!session) return unauthorized();
  return jsonOk({ user: session });
}
