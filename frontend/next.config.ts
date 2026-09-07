import { fileURLToPath } from 'node:url';

import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

import { parseMediaPattern } from './src/lib/media-host';

// Card pictures uploaded by admins are served from the R2 bucket, and
// next/image refuses any host it has not been told about. The value is read at
// build time, so rebuild the web app after pointing it at a new bucket.
const mediaPattern = parseMediaPattern(process.env.NEXT_PUBLIC_MEDIA_HOST);

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // A self-contained server bundle, so the runtime image carries what it runs
  // rather than the whole workspace's node_modules.
  output: 'standalone',
  // The workspace root, so tracing follows imports out of frontend/ and into
  // the hoisted node_modules at the top of the monorepo.
  outputFileTracingRoot: fileURLToPath(new URL('..', import.meta.url)),
  images: {
    remotePatterns: mediaPattern ? [mediaPattern] : [],
    // Sharp is not installed, and the pictures come off R2 already sized. Let
    // the bucket serve them rather than resizing on a Node process that has no
    // image library and answers 500 when asked to.
    unoptimized: true,
  },
};

export default createNextIntlPlugin('./src/i18n/request.ts')(nextConfig);
