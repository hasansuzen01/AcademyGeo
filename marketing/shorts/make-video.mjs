// Renders a 9:16 quiz short, in English and Turkish, from AcademyGeo cards.
//
//   node marketing/shorts/make-video.mjs marketing/shorts/specs/<name>.json
//
// A spec names the format, the cards (by country and clue slug) and the words
// on screen. Card titles, photos and credits come from the live atlas API, so
// every fact on screen is one the site already carries. Slides are HTML shot
// by headless Chrome, then joined by ffmpeg with a silent track: the music is
// added in each app, from its own licensed library.
//
// Photos are never cropped or drawn on: most are CC BY-SA, so they sit whole
// in a frame with their author and licence under them.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const API = 'https://api.academygeo.com/api';
const CHROME = process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const W = 1080;
const H = 1920;
const FADE = 0.35;

const LOGO = `<svg viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#35a047"/><rect width="64" height="60" rx="14" fill="#4cc15e"/><path d="M14 64h36L35 24h-6z" fill="#17282d"/><path d="M29.8 59h4.4l-.5-10h-3.4zM30.5 44.5h3l-.3-6.5h-2.4z" fill="#ffc93c"/><path d="M32 33c-5-7-9-11-9-16a9 9 0 0 1 18 0c0 5-4 9-9 16z" fill="#ff5a4e"/><circle cx="32" cy="17" r="3.6" fill="#fff"/></svg>`;

// Windows draws no flag emoji, so flags are pictures.
const flag = (code, cls = 'flag') => `<img class="${cls}" src="https://flagcdn.com/w640/${code.toLowerCase()}.png">`;

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800;900&display=block');
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${W}px;height:${H}px;overflow:hidden}
body{font-family:'Nunito',sans-serif;background:#f4f7f5;color:#17282d;position:relative}
.brand{position:absolute;top:110px;left:80px;display:flex;align-items:center;gap:20px;font-weight:900;font-size:40px;letter-spacing:-.5px}
.brand svg{width:72px;height:72px}
.stage{position:absolute;left:80px;right:140px;top:250px}
.chip{display:inline-block;background:#ffc93c;border-bottom:6px solid #e0a500;border-radius:22px;padding:12px 30px;font-weight:900;font-size:40px}
h1{font-weight:900;font-size:80px;line-height:1.08;letter-spacing:-1.5px;margin-top:30px}
h1.answer{display:flex;align-items:center;gap:26px}
h1 .mini{width:110px;border-radius:10px;box-shadow:0 6px 0 #d2ddd6}
.why{font-weight:800;font-size:46px;line-height:1.2;color:#35a047;margin-top:14px}
.head{height:250px;margin-top:30px;display:flex;flex-direction:column;justify-content:flex-end}
.head h1{margin-top:0}
.photo{margin-top:36px;background:#fff;border:3px solid #e4ebe7;border-bottom:10px solid #d2ddd6;border-radius:36px;padding:18px;display:inline-block;max-width:100%}
.photo img{display:block;max-width:824px;max-height:760px;width:auto;height:auto;border-radius:22px}
.credit{margin-top:16px;font-size:26px;font-weight:700;color:#566f78}
.dots{display:flex;gap:14px;margin-top:30px}
.dots i{width:70px;height:14px;border-radius:7px;background:#d2ddd6}
.dots i.on{background:#4cc15e}
.center{position:absolute;left:80px;right:140px;top:0;bottom:380px;display:flex;flex-direction:column;justify-content:center}
.eyebrow{font-weight:900;font-size:40px;letter-spacing:4px;text-transform:uppercase;color:#35a047}
.big{font-weight:900;font-size:124px;line-height:1.02;letter-spacing:-3px;margin-top:24px}
mark{background:linear-gradient(transparent 58%,#ffc93c 58%);color:inherit}
.sub{font-weight:800;font-size:54px;color:#566f78;margin-top:36px}
.road{height:18px;border-radius:9px;margin-top:60px;background:repeating-linear-gradient(90deg,#ffc93c 0 90px,transparent 90px 150px);width:100%}
.flag{width:300px;border-radius:14px;box-shadow:0 10px 0 #d2ddd6}
.flags{display:flex;gap:40px;align-items:center;margin-bottom:40px}
.flags .flag{width:240px}
.flags b{font-size:64px;font-weight:900;color:#566f78}
ul{list-style:none;margin-top:50px}
li{font-weight:800;font-size:52px;margin-top:22px;display:flex;align-items:center;gap:24px}
li b{display:inline-flex;align-items:center;justify-content:center;width:70px;height:70px;border-radius:50%;background:#4cc15e;color:#fff;font-size:40px;flex:none}
.url{display:inline-block;margin-top:50px;background:#4cc15e;border-bottom:10px solid #35a047;color:#fff;border-radius:34px;padding:26px 54px;font-weight:900;font-size:76px}
.small{font-weight:700;font-size:34px;color:#566f78;margin-top:40px;line-height:1.35}
.fine{position:absolute;left:80px;right:140px;bottom:420px;font-weight:700;font-size:26px;color:#8aa0a8}
`;

const UI = {
  en: {
    photo: 'Photo',
    cta: 'Practise these clues free',
    ctaSub: 'Real street photos · 136 countries · no account needed',
    unofficial: 'Unofficial · not affiliated with GeoGuessr',
  },
  tr: {
    photo: 'Fotoğraf',
    cta: 'Bu ipuçlarını ücretsiz çalış',
    ctaSub: 'Gerçek sokak fotoğrafları · 136 ülke · hesap açmadan başla',
    unofficial: 'Resmi değildir · GeoGuessr ile bağı yoktur',
  },
};

const page = (body) =>
  `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>${body}</body></html>`;
const brand = `<div class="brand">${LOGO}AcademyGeo</div>`;
const dots = (done, total) =>
  `<div class="dots">${Array.from({ length: total }, (_, j) => `<i class="${j < done ? 'on' : ''}"></i>`).join('')}</div>`;
const photoBlock = (card, ui) =>
  `<div class="photo"><img src="${card.file}"></div><p class="credit">${ui.photo}: ${card.credit.author} · ${card.credit.license} · Wikimedia Commons</p>`;

const hook = (t) =>
  page(`${brand}<div class="center">${t.hookFlags ? `<div class="flags">${t.hookFlags}</div>` : ''}<p class="eyebrow">${t.eyebrow}</p><p class="big">${t.hook}</p><p class="sub">${t.hookSub}</p><div class="road"></div></div>`);
const prompt = (t) => page(`${brand}<div class="center"><p class="big">${t.guess}</p><p class="sub">${t.guessSub}</p></div>`);
const cta = (ui) =>
  page(`<div class="center" style="align-items:flex-start">${LOGO.replace('<svg', '<svg style="width:170px;height:170px"')}<p class="big" style="font-size:104px;margin-top:50px">${ui.cta}</p><span class="url">academygeo.com</span><p class="small">${ui.ctaSub}</p></div><p class="fine">${ui.unofficial}</p>`);

const FORMATS = {
  // Three clues from one country, hardest first; the country comes last.
  'three-clues'(spec, cards, lang) {
    const t = spec.copy[lang];
    const ui = UI[lang];
    const country = spec.items[0].country;

    return [
      { secs: 2.6, html: hook(t) },
      ...cards.map((card, i) => ({
        secs: 4.4,
        html: page(`${brand}<div class="stage"><span class="chip">${t.clue(i + 1)}</span><h1>${spec.items[i].label[lang]}</h1>${photoBlock(card, ui)}${dots(i + 1, cards.length)}</div>`),
      })),
      { secs: 2.2, html: prompt(t) },
      {
        secs: 3.8,
        html: page(`${brand}<div class="center">${flag(country)}<p class="big" style="margin-top:50px">${t.country}</p><ul>${spec.items
          .map((item, i) => `<li><b>${i + 1}</b>${item.recap[lang]}</li>`)
          .join('')}</ul></div>`),
      },
      { secs: 3.4, html: cta(ui) },
    ];
  },

  // One photo at a time: which of two countries? Then the answer and why.
  which(spec, cards, lang) {
    const t = spec.copy[lang];
    const ui = UI[lang];
    const n = cards.length;

    return [
      { secs: 2.6, html: hook({ ...t, hookFlags: `${flag(spec.countries[0])}<b>/</b>${flag(spec.countries[1])}` }) },
      ...cards.flatMap((card, i) => {
        const item = spec.items[i];
        const chip = `<span class="chip">${i + 1} / ${n}</span>`;
        return [
          {
            secs: 2.8,
            html: page(`${brand}<div class="stage">${chip}<div class="head"><h1>${t.question}</h1></div>${photoBlock(card, ui)}${dots(i, n)}</div>`),
          },
          {
            secs: 3.0,
            html: page(`${brand}<div class="stage">${chip}<div class="head"><h1 class="answer">${flag(item.country, 'mini')}${t.names[item.country]}</h1><p class="why">${item.why[lang]}</p></div>${photoBlock(card, ui)}${dots(i + 1, n)}</div>`),
          },
        ];
      }),
      { secs: 2.2, html: prompt(t) },
      { secs: 3.4, html: cta(ui) },
    ];
  },
};

async function loadCards(spec, dir) {
  const byCountry = new Map();
  const cards = [];

  for (const [i, item] of spec.items.entries()) {
    if (!byCountry.has(item.country)) {
      const response = await fetch(`${API}/atlas/countries/${item.country}`);
      if (!response.ok) throw new Error(`atlas ${item.country}: HTTP ${response.status}`);
      byCountry.set(item.country, await response.json());
    }
    const clue = byCountry
      .get(item.country)
      .groups.flatMap((group) => group.clues)
      .find((c) => c.slug === item.clue);
    if (!clue) throw new Error(`No published card ${item.clue} for ${item.country}`);
    if (!clue.credit?.author || !clue.credit?.license) throw new Error(`${item.clue} has no photo credit`);

    const file = path.join(dir, `img-${i}${path.extname(new URL(clue.imageUrl).pathname) || '.jpg'}`);
    fs.writeFileSync(file, Buffer.from(await (await fetch(clue.imageUrl)).arrayBuffer()));
    cards.push({ ...clue, file: pathToFileURL(file).href });
  }

  return cards;
}

function render(spec, cards, lang, dir) {
  const slides = FORMATS[spec.format](spec, cards, lang);
  const out = path.join(dir, lang);
  fs.mkdirSync(out, { recursive: true });

  slides.forEach((slide, i) => {
    const html = path.join(out, `s${i}.html`);
    fs.writeFileSync(html, slide.html);
    execFileSync(CHROME, [
      '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
      `--window-size=${W},${H}`, '--virtual-time-budget=8000', '--allow-file-access-from-files',
      `--screenshot=${path.join(out, `s${i}.png`)}`, pathToFileURL(html).href,
    ], { stdio: 'ignore' });
  });

  // Each slide held for its time, cross-faded into the next.
  const inputs = slides.flatMap((s, i) => ['-loop', '1', '-t', String(s.secs), '-i', path.join(out, `s${i}.png`)]);
  let chain = '';
  let prev = '[0:v]';
  let offset = 0;
  slides.slice(1).forEach((_, k) => {
    offset += slides[k].secs - FADE;
    const label = k === slides.length - 2 ? '[v]' : `[x${k}]`;
    chain += `${prev}[${k + 1}:v]xfade=transition=fade:duration=${FADE}:offset=${offset.toFixed(2)}${label};`;
    prev = `[x${k}]`;
  });
  const total = slides.reduce((sum, s) => sum + s.secs, 0) - FADE * (slides.length - 1);
  const file = path.join(ROOT, 'out', `${spec.name}-${lang}.mp4`);

  execFileSync('ffmpeg', [
    '-y', ...inputs,
    '-f', 'lavfi', '-t', total.toFixed(2), '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100',
    '-filter_complex', `${chain}[v]format=yuv420p,scale=${W}:${H},fps=30[vo]`,
    '-map', '[vo]', '-map', `${slides.length}:a`,
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-c:a', 'aac', '-shortest', '-movflags', '+faststart',
    file,
  ], { stdio: 'ignore' });

  console.log(`${lang}: ${file} (${total.toFixed(1)}s)`);
}

const specPath = process.argv[2];
if (!specPath) throw new Error('Usage: node make-video.mjs <spec.json>');

// Specs are JSON, but the three-clues chip needs a number, so it is a template.
const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
for (const t of Object.values(spec.copy)) if (t.clue) t.clue = ((template) => (n) => template.replace('{n}', n))(t.clue);

const dir = path.join(ROOT, 'out', spec.name);
fs.mkdirSync(dir, { recursive: true });
const cards = await loadCards(spec, dir);
for (const lang of ['en', 'tr']) render(spec, cards, lang, dir);
