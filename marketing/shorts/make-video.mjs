// Renders a 9:16 "guess the country from 3 clues" short from AcademyGeo cards.
// Slides are HTML screenshotted by headless Chrome, then joined by ffmpeg.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const W = 1080;
const H = 1920;

const clues = JSON.parse(fs.readFileSync(path.join(ROOT, 'clues.json'), 'utf8'));
// Hardest first, the giveaway last: the Greek sign in the road-line photo.
const order = ['INFRASTRUCTURE', 'POLE', 'ROAD_LINE'];
const photos = { INFRASTRUCTURE: '1.jpg', ROAD_LINE: '2.jpg', POLE: '3.jpg' };
const cards = order.map((category) => ({
  ...clues.find((c) => c.category === category),
  file: pathToFileURL(path.join(ROOT, 'img', photos[category])).href,
}));

const COPY = {
  en: {
    eyebrow: 'GeoGuessr quiz',
    hook: 'Guess the country from <mark>3 clues</mark>',
    hookSub: 'How many do you need?',
    clue: (n) => `Clue ${n} / 3`,
    labels: ['Tiny churches on pillars by the road', 'Dark brown wooden poles', 'Solid yellow edge lines'],
    photo: 'Photo',
    guess: 'Your answer?',
    guessSub: 'Comment before the reveal 👇',
    country: 'Greece',
    recap: ['Roadside mini churches', 'Dark brown wooden poles', 'Yellow road lines'],
    cta: 'Practise these clues free',
    ctaSub: 'Real street photos · 136 countries · no account needed',
    unofficial: 'Unofficial · not affiliated with GeoGuessr',
  },
  tr: {
    eyebrow: 'GeoGuessr quiz',
    hook: '<mark>3 ipucundan</mark> ülkeyi bul',
    hookSub: 'Kaçıncı ipucunda bildin?',
    clue: (n) => `İpucu ${n} / 3`,
    labels: ['Yol kenarında sütun üstünde minik kiliseler', 'Koyu kahverengi ahşap direkler', 'Düz sarı kenar çizgileri'],
    photo: 'Fotoğraf',
    guess: 'Cevabın ne?',
    guessSub: 'Açıklamadan önce yoruma yaz 👇',
    country: 'Yunanistan',
    recap: ['Yol kenarında minik kiliseler', 'Koyu kahverengi ahşap direkler', 'Sarı yol çizgileri'],
    cta: 'Bu ipuçlarını ücretsiz çalış',
    ctaSub: 'Gerçek sokak fotoğrafları · 136 ülke · hesap açmadan başla',
    unofficial: 'Resmi değildir · GeoGuessr ile bağı yoktur',
  },
};

const LOGO = `<svg viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#35a047"/><rect width="64" height="60" rx="14" fill="#4cc15e"/><path d="M14 64h36L35 24h-6z" fill="#17282d"/><path d="M29.8 59h4.4l-.5-10h-3.4zM30.5 44.5h3l-.3-6.5h-2.4z" fill="#ffc93c"/><path d="M32 33c-5-7-9-11-9-16a9 9 0 0 1 18 0c0 5-4 9-9 16z" fill="#ff5a4e"/><circle cx="32" cy="17" r="3.6" fill="#fff"/></svg>`;

// Drawn rather than an emoji: Windows has no flag glyphs.
const FLAG_GR = `<svg viewBox="0 0 27 18" class="flag"><rect width="27" height="18" fill="#0d5eaf"/>${[1, 3, 5, 7]
  .map((i) => `<rect y="${i * 2}" width="27" height="2" fill="#fff"/>`)
  .join('')}<rect width="10" height="10" fill="#0d5eaf"/><rect x="4" width="2" height="10" fill="#fff"/><rect y="4" width="10" height="2" fill="#fff"/></svg>`;

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800;900&display=block');
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${W}px;height:${H}px;overflow:hidden}
body{font-family:'Nunito',sans-serif;background:#f4f7f5;color:#17282d;position:relative}
.brand{position:absolute;top:110px;left:80px;display:flex;align-items:center;gap:20px;font-weight:900;font-size:40px;letter-spacing:-.5px}
.brand svg{width:72px;height:72px}
.stage{position:absolute;left:80px;right:140px;top:250px}
.chip{display:inline-block;background:#ffc93c;border-bottom:6px solid #e0a500;border-radius:22px;padding:12px 30px;font-weight:900;font-size:40px}
h1{font-weight:900;font-size:84px;line-height:1.08;letter-spacing:-1.5px;margin-top:34px}
.photo{margin-top:46px;background:#fff;border:3px solid #e4ebe7;border-bottom:10px solid #d2ddd6;border-radius:36px;padding:18px}
.photo img{display:block;width:100%;height:auto;border-radius:22px}
.credit{margin-top:18px;font-size:28px;font-weight:700;color:#566f78}
.dots{display:flex;gap:14px;margin-top:40px}
.dots i{width:70px;height:14px;border-radius:7px;background:#d2ddd6}
.dots i.on{background:#4cc15e}
.center{position:absolute;left:80px;right:140px;top:0;bottom:380px;display:flex;flex-direction:column;justify-content:center}
.eyebrow{font-weight:900;font-size:40px;letter-spacing:4px;text-transform:uppercase;color:#35a047}
.big{font-weight:900;font-size:130px;line-height:1.02;letter-spacing:-3px;margin-top:24px}
mark{background:linear-gradient(transparent 58%,#ffc93c 58%);color:inherit}
.sub{font-weight:800;font-size:56px;color:#566f78;margin-top:36px}
.road{height:18px;border-radius:9px;margin-top:60px;background:repeating-linear-gradient(90deg,#ffc93c 0 90px,transparent 90px 150px);width:100%}
.flag{width:300px;border-radius:14px;box-shadow:0 10px 0 #d2ddd6}
ul{list-style:none;margin-top:50px}
li{font-weight:800;font-size:54px;margin-top:22px;display:flex;align-items:center;gap:24px}
li b{display:inline-flex;align-items:center;justify-content:center;width:70px;height:70px;border-radius:50%;background:#4cc15e;color:#fff;font-size:40px;flex:none}
.url{display:inline-block;margin-top:50px;background:#4cc15e;border-bottom:10px solid #35a047;color:#fff;border-radius:34px;padding:26px 54px;font-weight:900;font-size:76px}
.small{font-weight:700;font-size:34px;color:#566f78;margin-top:40px;line-height:1.35}
.fine{position:absolute;left:80px;right:140px;bottom:420px;font-weight:700;font-size:26px;color:#8aa0a8}
`;

const page = (body) =>
  `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>${body}</body></html>`;
const brand = `<div class="brand">${LOGO}AcademyGeo</div>`;

function slides(t) {
  const clue = (card, i) =>
    page(`${brand}<div class="stage">
      <span class="chip">${t.clue(i + 1)}</span>
      <h1>${t.labels[i]}</h1>
      <div class="photo"><img src="${card.file}"></div>
      <p class="credit">${t.photo}: ${card.credit.author} · ${card.credit.license} · Wikimedia Commons</p>
      <div class="dots">${[0, 1, 2].map((j) => `<i class="${j <= i ? 'on' : ''}"></i>`).join('')}</div>
    </div>`);

  return [
    { secs: 2.6, html: page(`${brand}<div class="center"><p class="eyebrow">${t.eyebrow}</p><p class="big">${t.hook}</p><p class="sub">${t.hookSub}</p><div class="road"></div></div>`) },
    ...cards.map((card, i) => ({ secs: 4.4, html: clue(card, i) })),
    { secs: 2.2, html: page(`${brand}<div class="center"><p class="big">${t.guess}</p><p class="sub">${t.guessSub}</p></div>`) },
    {
      secs: 3.8,
      html: page(`${brand}<div class="center">${FLAG_GR}<p class="big" style="margin-top:50px">${t.country}</p><ul>${t.recap
        .map((r, i) => `<li><b>${i + 1}</b>${r}</li>`)
        .join('')}</ul></div>`),
    },
    {
      secs: 3.4,
      html: page(`<div class="center" style="align-items:flex-start">${LOGO.replace('<svg', '<svg style="width:170px;height:170px"')}<p class="big" style="font-size:104px;margin-top:50px">${t.cta}</p><span class="url">academygeo.com</span><p class="small">${t.ctaSub}</p></div><p class="fine">${t.unofficial}</p>`),
    },
  ];
}

function render(lang) {
  const dir = path.join(ROOT, 'out', lang);
  fs.mkdirSync(dir, { recursive: true });
  const list = slides(COPY[lang]);

  list.forEach((slide, i) => {
    const html = path.join(dir, `s${i}.html`);
    fs.writeFileSync(html, slide.html);
    execFileSync(CHROME, [
      '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
      `--window-size=${W},${H}`, '--virtual-time-budget=8000', '--allow-file-access-from-files',
      `--screenshot=${path.join(dir, `s${i}.png`)}`, pathToFileURL(html).href,
    ], { stdio: 'ignore' });
  });

  // Each slide held for its time, cross-faded into the next.
  const FADE = 0.35;
  const inputs = list.flatMap((s, i) => ['-loop', '1', '-t', String(s.secs), '-i', path.join(dir, `s${i}.png`)]);
  let chain = '';
  let prev = '[0:v]';
  let offset = 0;
  list.slice(1).forEach((_, k) => {
    offset += list[k].secs - FADE;
    const out = k === list.length - 2 ? '[v]' : `[x${k}]`;
    chain += `${prev}[${k + 1}:v]xfade=transition=fade:duration=${FADE}:offset=${offset.toFixed(2)}${out};`;
    prev = `[x${k}]`;
  });
  const total = list.reduce((sum, s) => sum + s.secs, 0) - FADE * (list.length - 1);
  const file = path.join(ROOT, `academygeo-greece-3-clues-${lang}.mp4`);

  execFileSync('ffmpeg', [
    '-y', ...inputs,
    '-f', 'lavfi', '-t', total.toFixed(2), '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100',
    '-filter_complex', `${chain}[v]format=yuv420p,scale=${W}:${H},fps=30[vo]`,
    '-map', '[vo]', '-map', `${list.length}:a`,
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-c:a', 'aac', '-shortest', '-movflags', '+faststart',
    file,
  ], { stdio: 'ignore' });

  console.log(lang, '->', file, `${total.toFixed(1)}s`);
}

for (const lang of ['en', 'tr']) render(lang);
