// The gift card page, every state, against a mocked gift_card_view (27 Nov 2026). With the site served at
// http://127.0.0.1:8200/teri-app/ (python3 -m http.server 8200 from the folder above) and Playwright:
//   node _build/gift-walk.mjs chromium   ·   node _build/gift-walk.mjs webkit
import { createRequire } from 'node:module';
const { chromium, webkit, devices } = createRequire('/opt/npm-tools/node_modules/')('playwright');
const ENGINE = process.argv[2] || 'chromium';
const BASE = 'http://127.0.0.1:8200/teri-app/g';
const TOKEN = 'ab12cd34ef56gh78jk90';
const results = [];
function check(name, ok, info = '') { results.push([name, !!ok]); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : '  ← ' + info}`); }

const browser = ENGINE === 'webkit' ? await webkit.launch() : await chromium.launch({ executablePath: '/usr/bin/google-chrome' });
async function open(path, card, { reduced = false, status = 200, saved = {}, ua } = {}) {
  const ctx = await browser.newContext({ ...devices['iPhone 13'], ...(ua ? { userAgent: ua } : {}), reducedMotion: reduced ? 'reduce' : 'no-preference' });
  if (ENGINE === 'chromium') await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: 'http://127.0.0.1:8200' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  let calls = 0, reply = { status, card };
  await page.route('**/rest/v1/rpc/gift_card_view', async (route) => {
    calls++;
    const body = route.request().postDataJSON();
    if (reply.status !== 200) return route.fulfill({ status: reply.status, body: 'x' });
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body.p_token === TOKEN ? reply.card : null) });
  });
  if (Object.keys(saved).length) {
    await page.addInitScript((s) => { for (const [k, v] of Object.entries(s)) localStorage.setItem(k, v); }, saved);
  }
  await page.goto(BASE + path, { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);
  return { ctx, page, errors, calls: () => calls, setReply: (r) => { reply = r; } };
}
const vis = (page, id) => page.evaluate((i) => { const e = document.getElementById(i); return !!e && !e.hidden && e.offsetParent !== null; }, id);
const text = (page, id) => page.evaluate((i) => document.getElementById(i).textContent.trim(), id);
async function openIt(page) {
  await page.evaluate(() => document.getElementById('openBtn').click());
  await page.waitForFunction(() => !document.getElementById('open').hidden && document.getElementById('closed').hidden, null, { timeout: 15000 });
  await page.waitForTimeout(1800);
}

const paid = { status: 'paid', amount: 25000, design: 'birthday', to_name: 'Айгерим', from_name: 'Бота', message: null, lang: 'ru',
  code: 'K7QM-4TZX-9HWP', redeemed_at: null, phone_hint: null, confirm: true };

// 1. a paid card, the buyer confirms
{
  const { ctx, page, errors } = await open(`/ru/birthday/?t=${TOKEN}`, paid);
  check('closed: the envelope with her name', await vis(page, 'closed') && (await text(page, 'titleA')) === 'Айгерим,' && (await text(page, 'titleB')) === 'вам подарок');
  check('closed: the sender', (await text(page, 'from')) === 'Бота присылает открытку');
  check('closed: the code is not on the page', !(await page.content()).includes('K7QM-4TZX-9HWP'));
  await openIt(page);
  check('open: greeting after the name', (await text(page, 'to')) === 'Айгерим,' && (await text(page, 'greet')) === 'с днём рождения!');
  check('open: the ready wishes', (await text(page, 'wish')).startsWith('Пусть кожа сияет'));
  check('open: signed', (await text(page, 'sign')) === '— Бота');
  check('open: amount', (await text(page, 'amount')).replace(/\s/g, ' ') === '25 000 ₸');
  check('open: code hidden until tapped', (await text(page, 'codeValue')) === '' && !(await page.content()).includes('K7QM-4TZX-9HWP'));
  check('open: activate opens the gift in Teri', (await page.getAttribute('#activate', 'href')) === `teri://gift/${TOKEN}`);
  check('open: step 3 names the buyer', (await text(page, 'step3')).startsWith('Бота подтвердит активацию'));
  check('open: «как получить» shown', await vis(page, 'how'));
  check('open: notches on the dashed line', await page.evaluate(() => { const c = document.getElementById('card'), p = document.getElementById('perf'); return Math.abs(parseFloat(c.style.getPropertyValue('--py')) - (p.offsetTop + 1)) < 1; }));
  await page.evaluate(() => document.getElementById('codeBox').click());
  await page.waitForTimeout(700);
  check('reveal: the code is shown', (await text(page, 'codeValue')) === 'K7QM-4TZX-9HWP' && await page.evaluate(() => document.getElementById('code').classList.contains('shown')));
  check('reveal: «Скрыть» appears', (await text(page, 'toggleCode')) === 'Скрыть');
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { value: true, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
  await page.waitForTimeout(800);
  check('leaving the page hides the code again', (await text(page, 'codeValue')) === '' && !(await page.evaluate(() => document.getElementById('code').classList.contains('shown'))));
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { value: false, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
  if (ENGINE === 'chromium') {
    await page.evaluate(() => document.getElementById('copy').click());
    await page.waitForTimeout(300);
    check('copy: the code is in the clipboard, still hidden', (await page.evaluate(() => navigator.clipboard.readText())) === 'K7QM-4TZX-9HWP' && (await text(page, 'copy')) === 'Скопировано' && (await text(page, 'codeValue')) === '');
  }
  // the picture for stories
  await page.evaluate(() => document.getElementById('shareBtn').click());
  await page.waitForFunction(() => !!document.getElementById('preview').getAttribute('src'), null, { timeout: 8000 });
  const pic = await page.evaluate(async () => { const im = document.getElementById('preview'); await im.decode(); return [im.naturalWidth, im.naturalHeight]; });
  check('story: a 1080×1920 picture', pic[0] === 1080 && pic[1] === 1920, pic.join('×'));
  await page.evaluate(() => { const t = document.getElementById('withWish'); t.checked = false; t.dispatchEvent(new Event('change')); });
  await page.waitForFunction(() => !!document.getElementById('preview').getAttribute('src'), null, { timeout: 8000 });
  check('story: without the wishes too', true);
  await page.evaluate(() => document.getElementById('sheetClose').click());
  await page.waitForTimeout(600);
  check('story: the sheet closes', await page.evaluate(() => document.getElementById('sheet').hidden));
  // the language
  await page.evaluate(() => document.querySelector('.langs [data-lang="kk"]').click());
  await page.waitForTimeout(300);
  check('kk: the card in Kazakh', (await text(page, 'greet')) === 'туған күніңізбен!' && (await text(page, 'step3')).startsWith('Бота іске қосуды растайды') && (await page.evaluate(() => document.documentElement.lang)) === 'kk');
  check('kk: still open, envelope not back', await vis(page, 'open') && !(await vis(page, 'closed')));
  // open again
  await page.evaluate(() => document.getElementById('again').click());
  await page.waitForTimeout(500);
  check('again: the envelope is back', await vis(page, 'closed') && !(await vis(page, 'open')));
  await openIt(page);
  check('again: opens again', await vis(page, 'open'));
  check('no errors on the page', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

// 2. an older card bound to a number, no buyer confirmation
{
  const { ctx, page, errors } = await open(`/?t=${TOKEN}`, { ...paid, design: 'newyear', confirm: false, phone_hint: '67', lang: 'kk', to_name: null, from_name: null });
  check('old link /g/?t=: opens', await vis(page, 'closed'));
  check('card language kk by default', (await page.evaluate(() => document.documentElement.lang)) === 'kk' && (await text(page, 'titleA')) === 'Сізге');
  check('no sender line without a name', !(await vis(page, 'from')));
  check('new year colours', (await page.getAttribute('body', 'data-design')) === 'newyear');
  await openIt(page);
  check('no name: the greeting alone', !(await vis(page, 'to')) && (await text(page, 'greet')) === 'Жаңа жылыңызбен!' && !(await vis(page, 'sign')));
  check('number lock text', (await text(page, 'lockText')).includes('67'));
  check('step 3: the money comes at once', (await text(page, 'step3')).startsWith('Сома бірден'));
  check('no errors', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

// 3. activated already: straight to the card
{
  const { ctx, page, errors } = await open(`/ru/thanks/?t=${TOKEN}`, { ...paid, design: 'thanks', status: 'redeemed', code: null });
  check('redeemed: the card at once', await vis(page, 'open') && !(await vis(page, 'closed')));
  check('redeemed: «уже активирован»', await vis(page, 'done') && !(await vis(page, 'code')) && !(await vis(page, 'how')));
  check('redeemed: «Открыть Teri»', (await text(page, 'activate')) === 'Открыть Teri' && (await page.getAttribute('#activate', 'href')) === 'teri://gift-cards');
  check('no errors', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

// 4. opened before on this phone: the card, then «Открыть заново»
{
  const { ctx, page } = await open(`/ru/any/?t=${TOKEN}`, { ...paid, design: 'any' }, { saved: { ['teri.gift.' + TOKEN]: 'opened' } });
  check('opened before: straight to the card', await vis(page, 'open'));
  await page.waitForTimeout(1500);
  check('opened before: the card is visible', await page.evaluate(() => getComputedStyle(document.getElementById('greet')).opacity === '1'));
  await ctx.close();
}

// 5. problems
{
  const a = await open(`/ru/any/?t=${TOKEN}`, { ...paid, status: 'cancelled' });
  check('cancelled: a message, no retry', await vis(a.page, 'problem') && (await text(a.page, 'problemText')).startsWith('Этот сертификат больше не действует') && !(await vis(a.page, 'retry')));
  await a.ctx.close();
  const b = await open(`/ru/any/?t=zz12cd34ef56gh78jk90`, paid);
  check('unknown link: «не найдена»', await vis(b.page, 'problem') && (await text(b.page, 'problemText')).startsWith('Открытка не найдена'));
  await b.ctx.close();
  const c = await open(`/ru/any/?t=bad`, paid);
  check('broken link: no request, «не найдена»', c.calls() === 0 && (await text(c.page, 'problemText')).startsWith('Открытка не найдена'));
  await c.ctx.close();
  const d = await open(`/ru/any/?t=${TOKEN}`, paid, { status: 500 });
  check('server error: «не удалось» with retry', await vis(d.page, 'problem') && await vis(d.page, 'retry'));
  d.setReply({ status: 200, card: paid });
  await d.page.evaluate(() => document.getElementById('retry').click());
  await d.page.waitForTimeout(1200);
  check('retry: the envelope', await vis(d.page, 'closed'));
  await d.ctx.close();
}

// 6. her own words, long, with a line break, and names that look like code
{
  const msg = 'Дорогая моя, <b>с праздником</b>!\nПусть каждый день будет таким же светлым, как ты. Обнимаю крепко-крепко и жду в гости в субботу!';
  const { ctx, page, errors } = await open(`/ru/march8/?t=${TOKEN}`, { ...paid, design: 'march8', message: msg, to_name: '<img src=x onerror=alert(1)>', from_name: 'Мама' });
  check('names stay text', (await text(page, 'titleA')).startsWith('<img') && !(await page.$('img[src="x"]')));
  await openIt(page);
  check('her words, line break kept', (await page.evaluate(() => document.getElementById('wish').innerHTML)).includes('<br>') && (await text(page, 'wish')).includes('<b>с праздником</b>'));
  check('long words a bit smaller', await page.evaluate(() => document.getElementById('wish').classList.contains('long')));
  check('no errors', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

// 7. reduced motion and Android while Google Play is not open yet
{
  const { ctx, page, errors } = await open(`/kk/birthday/?t=${TOKEN}`, paid, { reduced: true,
    ua: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36' });
  await page.evaluate(() => document.getElementById('openBtn').click());
  await page.waitForTimeout(900);
  check('reduced motion: the card without the envelope animation', await vis(page, 'open') && await page.evaluate(() => document.getElementById('burst').hidden && document.getElementById('ambient').hidden));
  check('android: honest first step', (await text(page, 'step1')).startsWith('Teri для Android') || (await text(page, 'step1')).startsWith('Android-қа'));
  check('no errors', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

await browser.close();
const failed = results.filter((r) => !r[1]).length;
console.log(`\n${ENGINE}: ${results.length - failed}/${results.length} checks pass`);
process.exit(failed ? 1 : 0);
