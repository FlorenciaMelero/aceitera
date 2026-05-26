import type { Metadata, Viewport } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import PortalEntryPage from '@/components/portal/portal-entry';
import { PORTAL_TOKEN_COOKIE } from '@/lib/portal-storage';

export const metadata: Metadata = {
  title: 'Mi vehículo | MP Lubricentro',
  description: 'Consultá el estado de tu vehículo y próximos services',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'MP Lubricentro',
  },
};

export const viewport: Viewport = {
  themeColor: '#ff7a00',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default async function PortalHomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(PORTAL_TOKEN_COOKIE)?.value;
  if (token) redirect(`/portal/${token}`);

  return <PortalEntryPage />;
}
