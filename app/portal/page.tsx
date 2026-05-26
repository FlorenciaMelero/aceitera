import type { Metadata, Viewport } from 'next';
import PortalEntryPage from '@/components/portal/portal-entry';

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

export default function PortalHomePage() {
  return <PortalEntryPage />;
}
