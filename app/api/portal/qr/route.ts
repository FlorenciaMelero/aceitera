import QRCode from 'qrcode';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const data = searchParams.get('data');

  if (!data) {
    return NextResponse.json({ error: 'data requerido' }, { status: 400 });
  }

  try {
    const svg = await QRCode.toString(data, {
      type: 'svg',
      margin: 2,
      width: 280,
      color: { dark: '#09090b', light: '#ffffff' },
    });
    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Error generando QR' }, { status: 500 });
  }
}
