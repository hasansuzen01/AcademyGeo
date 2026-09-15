/**
 * Draws the favicon and the app icons from the brand mark.
 *
 * The shapes are the ones in src/components/brand-mark.tsx with the theme
 * colours written out, because a browser tab and a home screen read an image
 * file, not the stylesheet. They are rendered here and committed rather than
 * on every build: the icons change when the mark does, which is almost never.
 *
 * Run with: npm run icons:build --workspace frontend
 */
import { writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const APP = join(ROOT, 'src', 'app');
const PUBLIC = join(ROOT, 'public');

/**
 * The mark as an SVG document.
 *
 * `radius` rounds the tile. Browser tabs get the rounded tile on a transparent
 * ground; iOS and Android cut their own shape out of an icon, so those get the
 * square one and a rounded corner of ours never shows up as a notch in theirs.
 */
function mark({ radius, size }: { radius: number; size?: number }): string {
  const dimensions = size ? ` width="${size}" height="${size}"` : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"${dimensions}>
  <rect width="64" height="64" rx="${radius}" fill="#35a047"/>
  <rect width="64" height="60" rx="${radius}" fill="#4cc15e"/>
  <path d="M14 64h36L35 24h-6z" fill="#17282d"/>
  <path d="M29.8 59h4.4l-.5-10h-3.4zM30.5 44.5h3l-.3-6.5h-2.4z" fill="#ffc93c"/>
  <path d="M32 33c-5-7-9-11-9-16a9 9 0 0 1 18 0c0 5-4 9-9 16z" fill="#ff5a4e"/>
  <circle cx="32" cy="17" r="3.6" fill="#ffffff"/>
</svg>
`;
}

const ROUNDED = 14;
const SQUARE = 0;

function png(radius: number, size: number): Promise<Buffer> {
  return sharp(Buffer.from(mark({ radius, size })))
    .png()
    .toBuffer();
}

/**
 * An .ico holding PNG images. Every browser that still asks for favicon.ico
 * reads PNG entries, and it saves carrying a bitmap encoder for three sizes.
 */
function ico(images: { size: number; data: Buffer }[]): Buffer {
  const header = Buffer.alloc(6 + 16 * images.length);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  let offset = header.length;
  images.forEach(({ size, data }, index) => {
    const entry = 6 + 16 * index;
    // A width or height of 256 is written as 0: the field is one byte.
    header.writeUInt8(size >= 256 ? 0 : size, entry);
    header.writeUInt8(size >= 256 ? 0 : size, entry + 1);
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(data.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += data.length;
  });

  return Buffer.concat([header, ...images.map((image) => image.data)]);
}

const faviconSizes = [16, 32, 48];
const favicon = ico(
  await Promise.all(
    faviconSizes.map(async (size) => ({ size, data: await png(ROUNDED, size) })),
  ),
);

const outputs: [string, string | Buffer][] = [
  [join(APP, 'icon.svg'), mark({ radius: ROUNDED })],
  [join(APP, 'favicon.ico'), favicon],
  [join(APP, 'apple-icon.png'), await png(SQUARE, 180)],
  [join(PUBLIC, 'icon-192.png'), await png(ROUNDED, 192)],
  [join(PUBLIC, 'icon-512.png'), await png(ROUNDED, 512)],
  [join(PUBLIC, 'icon-maskable-512.png'), await png(SQUARE, 512)],
];

await Promise.all(outputs.map(([path, contents]) => writeFile(path, contents)));

for (const [path] of outputs) console.log(`Wrote ${path}`);
