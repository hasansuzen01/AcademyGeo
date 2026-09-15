import type { MetadataRoute } from 'next';

/**
 * What a phone needs to put AcademyGeo on its home screen. The icons are
 * rendered from the brand mark by scripts/generate-icons.ts.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AcademyGeo',
    short_name: 'AcademyGeo',
    description: 'Read the road, name the country',
    start_url: '/',
    display: 'standalone',
    background_color: '#f4f7f5',
    theme_color: '#ffffff',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
