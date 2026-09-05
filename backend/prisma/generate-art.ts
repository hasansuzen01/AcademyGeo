/**
 * Draws one SVG per meta into the web app's public folder. The cards need a
 * consistent, license-free illustration of each clue, so they are generated
 * from the catalogue rather than sourced from photographs.
 *
 * Run with: npm run seed:art --workspace backend
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { type ArtSpec, METAS } from './catalogue.ts';

const WIDTH = 640;
const BACKDROP = '#eef3f0';
const HEIGHT = 400;

const OUTPUT_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  'web',
  'public',
  'metas',
);

function escapeText(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Cards sit on a light surface, so every drawing gets its own soft ground. */
function frame(children: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}" role="img">
  <rect width="${WIDTH}" height="${HEIGHT}" rx="28" fill="${BACKDROP}"/>
  ${children}
</svg>
`;
}

function drawPlate(art: Extract<ArtSpec, { kind: 'plate' }>): string {
  const plateX = 56;
  const plateWidth = WIDTH - plateX * 2;
  const stripHeight = art.topStrip ? 44 : 0;
  const plateY = 116;
  const plateHeight = 168 + stripHeight;
  const bandWidth = art.band ? 62 : 0;

  const parts = [
    `<rect x="${plateX}" y="${plateY}" width="${plateWidth}" height="${plateHeight}" rx="16" fill="${art.body}" stroke="#0f172a" stroke-width="6"/>`,
  ];

  if (art.topStrip) {
    parts.push(
      `<path d="M ${plateX + 4} ${plateY + stripHeight} v -${stripHeight - 16} a 12 12 0 0 1 12 -12 h ${plateWidth - 32} a 12 12 0 0 1 12 12 v ${stripHeight - 16} z" fill="${art.topStrip.color}"/>`,
      `<text x="${WIDTH / 2}" y="${plateY + 31}" fill="#f8fafc" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="700" letter-spacing="3" text-anchor="middle">${escapeText(art.topStrip.label)}</text>`,
    );
  }

  if (art.band) {
    parts.push(
      `<path d="M ${plateX + 4} ${plateY + stripHeight + 4} h ${bandWidth} v ${plateHeight - stripHeight - 8} h -${bandWidth - 12} a 12 12 0 0 1 -12 -12 z" fill="${art.band.color}"/>`,
      `<circle cx="${plateX + 34}" cy="${plateY + stripHeight + 52}" r="18" fill="none" stroke="#facc15" stroke-width="3"/>`,
      `<text x="${plateX + 34}" y="${plateY + plateHeight - 26}" fill="${art.band.labelColor}" font-family="Inter, Arial, sans-serif" font-size="26" font-weight="700" text-anchor="middle">${escapeText(art.band.label)}</text>`,
    );
  }

  parts.push(
    `<text x="${plateX + bandWidth + (plateWidth - bandWidth) / 2}" y="${plateY + stripHeight + 98}" fill="${art.textColor}" font-family="Inter, Arial, sans-serif" font-size="58" font-weight="700" letter-spacing="4" text-anchor="middle">${escapeText(art.text)}</text>`,
  );

  return frame(parts.join('\n  '));
}

function drawBollard(art: Extract<ArtSpec, { kind: 'bollard' }>): string {
  const centre = WIDTH / 2;
  const width = 88;
  const top = 70;
  const bottom = HEIGHT - 60;
  const radius = art.rounded ? width / 2 : 10;

  const parts = [
    `<rect x="0" y="${bottom}" width="${WIDTH}" height="${HEIGHT - bottom}" fill="#9fb0b6"/>`,
    `<rect x="${centre - width / 2}" y="${top}" width="${width}" height="${bottom - top}" rx="${radius}" fill="${art.body}" stroke="#17282d" stroke-width="3"/>`,
    `<path d="M ${centre - width / 2} ${top + 60} h ${width} v -${60 - radius} a ${radius} ${radius} 0 0 0 -${radius} -${radius} h -${width - radius * 2} a ${radius} ${radius} 0 0 0 -${radius} ${radius} z" fill="${art.cap}"/>`,
  ];

  if (art.stripe) {
    parts.push(
      `<rect x="${centre - width / 2 + 14}" y="${top + 92}" width="${width - 28}" height="34" rx="6" fill="${art.stripe}"/>`,
    );
  }

  return frame(parts.join('\n  '));
}

function drawRoad(art: Extract<ArtSpec, { kind: 'road' }>): string {
  const parts = [
    `<rect x="0" y="0" width="${WIDTH}" height="${HEIGHT}" fill="#cfe3d2"/>`,
    `<path d="M ${WIDTH / 2 - 40} 40 L ${WIDTH / 2 + 40} 40 L ${WIDTH} ${HEIGHT} L 0 ${HEIGHT} Z" fill="#8d9aa1"/>`,
    `<path d="M ${WIDTH / 2 - 34} 40 L ${WIDTH / 2 - 30} 40 L 90 ${HEIGHT} L 30 ${HEIGHT} Z" fill="${art.edge}"/>`,
    `<path d="M ${WIDTH / 2 + 30} 40 L ${WIDTH / 2 + 34} 40 L ${WIDTH - 30} ${HEIGHT} L ${WIDTH - 90} ${HEIGHT} Z" fill="${art.edge}"/>`,
  ];

  if (art.dashed) {
    const dashes = [
      [60, 96, 6],
      [140, 200, 10],
      [230, 320, 16],
      [340, 400, 24],
    ];
    for (const [y1, y2, halfWidth] of dashes) {
      parts.push(
        `<path d="M ${WIDTH / 2 - halfWidth / 2} ${y1} h ${halfWidth} l ${halfWidth / 3} ${y2 - y1} h -${halfWidth * 1.6} Z" fill="${art.centre}"/>`,
      );
    }
  } else {
    parts.push(
      `<path d="M ${WIDTH / 2 - 4} 40 h 8 l 26 ${HEIGHT - 40} h -60 Z" fill="${art.centre}"/>`,
    );
  }

  return frame(parts.join('\n  '));
}

function drawSign(art: Extract<ArtSpec, { kind: 'sign' }>): string {
  const boxWidth = 460;
  const boxHeight = 190;
  const x = (WIDTH - boxWidth) / 2;
  const y = 80;

  return frame(
    [
      `<rect x="${WIDTH / 2 - 8}" y="${y + boxHeight}" width="16" height="${HEIGHT - y - boxHeight}" fill="#9fb0b6"/>`,
      `<rect x="${x}" y="${y}" width="${boxWidth}" height="${boxHeight}" rx="${art.rounded ? 28 : 8}" fill="${art.background}" stroke="${art.foreground}" stroke-width="6"/>`,
      `<text x="${WIDTH / 2}" y="${y + boxHeight / 2 + 18}" fill="${art.foreground}" font-family="Inter, Noto Sans, Arial, sans-serif" font-size="52" font-weight="600" text-anchor="middle">${escapeText(art.text)}</text>`,
    ].join('\n  '),
  );
}

function drawScene(art: Extract<ArtSpec, { kind: 'scene' }>): string {
  const horizon = 250;
  const parts = [
    `<rect x="0" y="0" width="${WIDTH}" height="${horizon}" fill="${art.sky}"/>`,
    `<rect x="0" y="${horizon}" width="${WIDTH}" height="${HEIGHT - horizon}" fill="${art.ground}"/>`,
  ];

  if (art.motif === 'trees') {
    for (let i = 0; i < 7; i += 1) {
      const x = 50 + i * 90;
      const height = 90 + ((i * 37) % 70);
      parts.push(
        `<rect x="${x - 5}" y="${horizon - height}" width="10" height="${height}" fill="#e2e8f0"/>`,
        `<ellipse cx="${x}" cy="${horizon - height - 18}" rx="34" ry="42" fill="${art.accent}"/>`,
      );
    }
  }

  if (art.motif === 'poles') {
    for (let i = 0; i < 5; i += 1) {
      const x = 70 + i * 130;
      parts.push(
        `<rect x="${x - 6}" y="${horizon - 190}" width="12" height="190" fill="${art.accent}"/>`,
        `<rect x="${x - 30}" y="${horizon - 172}" width="60" height="8" fill="${art.accent}"/>`,
        `<rect x="${x + 8}" y="${horizon - 148}" width="22" height="38" rx="10" fill="#cbd5e1"/>`,
        `<path d="M ${x} ${horizon - 168} Q ${x + 65} ${horizon - 150} ${x + 130} ${horizon - 168}" stroke="#1f2937" stroke-width="3" fill="none"/>`,
      );
    }
  }

  if (art.motif === 'roofs') {
    for (let i = 0; i < 4; i += 1) {
      const x = 40 + i * 150;
      const height = 120 + ((i * 41) % 60);
      parts.push(
        `<rect x="${x}" y="${horizon - height}" width="110" height="${height}" fill="#d6d3d1"/>`,
        `<path d="M ${x - 12} ${horizon - height} L ${x + 55} ${horizon - height - 34} L ${x + 122} ${horizon - height} Z" fill="${art.accent}"/>`,
        `<rect x="${x + 18}" y="${horizon - height + 30}" width="24" height="30" fill="#0f172a" opacity="0.35"/>`,
        `<rect x="${x + 66}" y="${horizon - height + 30}" width="24" height="30" fill="#0f172a" opacity="0.35"/>`,
      );
    }
  }

  return frame(parts.join('\n  '));
}

function render(art: ArtSpec): string {
  switch (art.kind) {
    case 'plate':
      return drawPlate(art);
    case 'bollard':
      return drawBollard(art);
    case 'road':
      return drawRoad(art);
    case 'sign':
      return drawSign(art);
    case 'scene':
      return drawScene(art);
  }
}

async function main(): Promise<void> {
  await mkdir(OUTPUT_DIR, { recursive: true });

  await Promise.all(
    METAS.map((meta) => writeFile(join(OUTPUT_DIR, `${meta.slug}.svg`), render(meta.art), 'utf8')),
  );

  console.log(`Rendered ${METAS.length} meta illustrations into ${OUTPUT_DIR}`);
}

await main();
