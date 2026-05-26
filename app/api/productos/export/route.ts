import { getApiSession, jsonOk, unauthorized } from '@/lib/api-helpers';
import { listProductos, productosToExportRows } from '@/lib/data-provider';
import * as XLSX from 'xlsx';

export async function GET(request: Request) {
  const session = await getApiSession(request as import('next/server').NextRequest);
  if (!session) return unauthorized();

  const productos = await listProductos();
  const rows = productosToExportRows(productos);
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Inventario');
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  return new Response(buf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=inventario.xlsx',
    },
  });
}
