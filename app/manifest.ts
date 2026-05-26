import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MP Lubricentro — Mi vehículo',
    short_name: 'MP Lubri',
    description: 'Consultá el estado de tu vehículo y próximos services en MP Lubricentro',
    start_url: '/portal',
    scope: '/portal',
    id: '/portal',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#09090b',
    theme_color: '#ff7a00',
    lang: 'es-AR',
    categories: ['automotive', 'utilities'],
    icons: [
      {
        src: '/icons/icon-192.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
  };
}
