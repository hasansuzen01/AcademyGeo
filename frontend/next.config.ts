import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

import { parseMediaPattern } from './src/lib/media-host';

// Card pictures uploaded by admins are served from the R2 bucket, and
// next/image refuses any host it has not been told about. The value is read at
// build time, so rebuild the web app after pointing it at a new bucket.
const mediaPattern = parseMediaPattern(process.env.NEXT_PUBLIC_MEDIA_HOST);

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: mediaPattern ? [mediaPattern] : [],
  },
};

export default createNextIntlPlugin('./src/i18n/request.ts')(nextConfig);
