// The link-preview pictures of the gift card (27 Nov 2026): node _build/og.mjs [base-url]
// Needs the site served at <base-url>/teri-app/ (python3 -m http.server from the folder above it) and
// Playwright. Writes g/og/<ru|kk>-<design>.jpg and g/og/gift.jpg (both languages, for older links).
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const BASE = process.argv[2] || 'http://127.0.0.1:8200';
const { chromium } = createRequire(process.env.PLAYWRIGHT_DIR || '/opt/npm-tools/node_modules/')('playwright');
const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 2 });
fs.mkdirSync(path.join(ROOT, 'g/og'), { recursive: true });
const jobs = [];
for (const l of ['ru', 'kk']) for (const d of ['birthday', 'newyear', 'march8', 'thanks', 'any']) jobs.push([l, d, `${l}-${d}`]);
jobs.push(['both', 'any', 'gift']);
for (const [l, d, name] of jobs) {
  await page.goto(`${BASE}/teri-app/_build/og.html?d=${d}&l=${l}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('body[data-ready]');
  await page.waitForTimeout(150);
  const png = path.join('/tmp', `og-${name}.png`);
  await page.screenshot({ path: png });
  // 2× drawn, saved at 1200 × 630 as a JPEG (WhatsApp and Telegram load it quickly)
  execFileSync('python3', ['-c', `
from PIL import Image
im = Image.open('${png}').convert('RGB').resize((1200, 630), Image.LANCZOS)
im.save('${path.join(ROOT, 'g/og', name + '.jpg')}', 'JPEG', quality=86, optimize=True, progressive=True)
`]);
  console.log(name, fs.statSync(path.join(ROOT, 'g/og', name + '.jpg')).size);
}
await browser.close();
