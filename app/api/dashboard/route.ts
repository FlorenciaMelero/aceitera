import { getApiSession, jsonOk, unauthorized } from '@/lib/api-helpers';
import {
  getDashboardKPIs,
  getDashboardCharts,
  globalSearch,
  getConfiguracion,
  updateConfiguracion,
  listUsuarios,
  listCombos,
  saveCombo,
  deleteCombo,
  listCategoriasMarcas,
  saveCategoriaMarca,
  getAuditLog,
  getProductosPorVencer,
  getAlertasService,
} from '@/lib/data-provider';

export async function GET(request: Request) {
  const session = await getApiSession(request as import('next/server').NextRequest);
  if (!session) return unauthorized();

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  switch (type) {
    case 'kpis':
      return jsonOk(await getDashboardKPIs());
    case 'charts':
      return jsonOk(await getDashboardCharts());
    case 'search':
      return jsonOk(await globalSearch(searchParams.get('q') || ''));
    case 'config':
      return jsonOk(await getConfiguracion());
    case 'usuarios':
      return jsonOk(await listUsuarios());
    case 'combos':
      return jsonOk(await listCombos());
    case 'categorias':
      return jsonOk(await listCategoriasMarcas(searchParams.get('tipo') as 'categoria' | 'marca' | undefined));
    case 'audit':
      return jsonOk(await getAuditLog());
    case 'por-vencer':
      return jsonOk(await getProductosPorVencer());
    case 'alertas-service':
      return jsonOk(await getAlertasService());
    default:
      return jsonOk(await getDashboardKPIs());
  }
}

export async function PUT(request: Request) {
  const session = await getApiSession(request as import('next/server').NextRequest);
  if (!session) return unauthorized();

  const body = await request.json();
  if (body.type === 'categoria') {
    await saveCategoriaMarca(body.nombre, body.tipo, session.id, body.id);
    return jsonOk({ ok: true });
  }
  if (body.type === 'combo') {
    const combo = await saveCombo(body, session.id, body.id);
    return jsonOk(combo);
  }
  const config = await updateConfiguracion(body, session.id);
  return jsonOk(config);
}

export async function DELETE(request: Request) {
  const session = await getApiSession(request as import('next/server').NextRequest);
  if (!session) return unauthorized();

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const id = searchParams.get('id');
  if (type === 'combo' && id) {
    await deleteCombo(id, session.id);
    return jsonOk({ ok: true });
  }
  return jsonOk({ error: 'Not found' }, 404);
}
