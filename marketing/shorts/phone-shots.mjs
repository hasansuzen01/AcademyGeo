// Takes real phone-sized screenshots of the live practice page: the question,
// then the answer with its explanation and photo credit, for marketing art.
//
//   node marketing/shorts/phone-shots.mjs <out-dir> [locale]
//
// Uses Chrome's own device emulation over the DevTools protocol, since a
// desktop window will not open narrower than about 500px.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const CHROME = process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9333;
const [outDir = '.', locale = 'tr'] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });

const profile = fs.mkdtempSync(path.join(outDir, 'chrome-'));
const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, 'about:blank',
]);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

try {
  let target;
  for (let i = 0; i < 50 && !target; i += 1) {
    await sleep(200);
    target = await fetch(`http://127.0.0.1:${PORT}/json`).then((r) => r.json()).then((list) => list.find((t) => t.type === 'page')).catch(() => undefined);
  }
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve) => ws.addEventListener('open', resolve, { once: true }));
  let id = 0;
  let queueRequest;
  const pending = new Map();
  ws.addEventListener('message', (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) pending.get(msg.id)(msg);
    if (msg.method === 'Network.responseReceived' && msg.params.response.url.includes('/review/queue')) queueRequest = msg.params.requestId;
  });
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      id += 1;
      pending.set(id, (msg) => (msg.error ? reject(new Error(`${method}: ${msg.error.message}`)) : resolve(msg.result)));
      ws.send(JSON.stringify({ id, method, params }));
    });
  const evaluate = async (expression) => (await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })).result.value;
  const shot = async (name) => {
    const { data } = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(outDir, name), Buffer.from(data, 'base64'));
    console.log('saved', name);
  };

  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 3, mobile: true });
  await send('Emulation.setUserAgentOverride', {
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
  });
  await send('Page.enable');
  await send('Network.enable');
  await send('Page.navigate', { url: `https://academygeo.com/${locale}/play/practice` });

  // Wait until the dealt card's picture has loaded.
  for (let i = 0; i < 60; i += 1) {
    await sleep(500);
    if (await evaluate(`[...document.querySelectorAll('main img')].some((img) => img.complete && img.naturalWidth > 0)`)) break;
  }
  await sleep(1200);
  // Scroll so the card sits under the header, as a player would see it.
  await evaluate(`window.scrollTo(0, 0)`);
  await shot('question.png');

  // Answer correctly: the dealt card is read from the queue the page
  // fetched, and the site's own guest check names its country.
  const { body } = await send('Network.getResponseBody', { requestId: queueRequest });
  const card = JSON.parse(body).cards[0];
  const verdict = await evaluate(`fetch('https://api.academygeo.com/api/review/check', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ metaId: '${card.metaId}', guessedCountryCode: '${card.choices[0].code}' }) }).then((r) => r.json())`);
  const name = locale === 'tr' ? verdict.country.nameTr : verdict.country.nameEn;
  const clicked = await evaluate(`(() => { const b = [...document.querySelectorAll('main button')].find((x) => x.textContent.includes(${JSON.stringify(name)})); b?.click(); return Boolean(b); })()`);
  console.log('answer:', name, clicked ? '(clicked)' : '(button not found)');
  await sleep(2500);
  const reveal = await evaluate(`(() => { const el = [...document.querySelectorAll('main *')].find((n) => /Fotoğraf|Photo/.test(n.textContent) && n.children.length === 0); if (el) el.scrollIntoView({ block: 'end' }); return el?.textContent ?? null; })()`);
  await sleep(800);
  await shot('answer.png');
  console.log('credit line:', reveal);

  ws.close();
} finally {
  chrome.kill();
  await sleep(500);
  fs.rmSync(profile, { recursive: true, force: true });
}
