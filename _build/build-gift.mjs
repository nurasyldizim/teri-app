// Builds the gift card pages from _build/gift.html (27 Nov 2026): node _build/build-gift.mjs
//   g/index.html                 — the older links …/g/?t=… (both languages in the link preview)
//   g/<ru|kk>/<occasion>/index.html — the links the apps send since Teri 1.0.6: the same page, but the
//                                  link preview (WhatsApp, Telegram, Instagram) shows the occasion's
//                                  picture and words in the card's language.
// Folders starting with «_» are not published by GitHub Pages, so this file and the template stay private.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const SITE = 'https://nurasyldizim.github.io/teri-app';
const tpl = fs.readFileSync(path.join(ROOT, '_build/gift.html'), 'utf8');
const version = crypto.createHash('sha1')
  .update(fs.readFileSync(path.join(ROOT, 'g/gift.js')))
  .update(fs.readFileSync(path.join(ROOT, 'g/gift.css')))
  .digest('hex').slice(0, 8);

const THEME = { birthday: '#FFEEE2', newyear: '#155443', march8: '#FFEDF3', thanks: '#F2F8E8', any: '#F4EDFF' };
const TITLE = {
  ru: { birthday: 'Вам подарок на день рождения', newyear: 'Вам новогодний подарок', march8: 'Вам подарок к 8 Марта', thanks: 'Вам подарок в знак благодарности', any: 'Вам подарок' },
  kk: { birthday: 'Туған күніңізге сыйлық', newyear: 'Сізге жаңажылдық сыйлық', march8: '8 наурыз мерекесіне сыйлық', thanks: 'Сізге алғыс ретінде сыйлық', any: 'Сізге сыйлық' },
};
const DESC = {
  ru: 'Откройте открытку: внутри пожелание и подарочный сертификат на корейский уход.',
  kk: 'Ашықхатты ашыңыз: ішінде тілек пен корей күтіміне арналған сыйлық сертификаты бар.',
};
const ALT = { ru: 'Конверт с открыткой Teri', kk: 'Teri ашықхаты салынған конверт' };

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
function page(file, v) {
  let html = tpl;
  for (const [k, val] of Object.entries({ ...v, VERSION: version, NOTE: 'Made by _build/build-gift.mjs from _build/gift.html: change the template, then run the script.' })) {
    html = html.split(`{{${k}}}`).join(esc(val));
  }
  if (/\{\{[A-Z]+\}\}/.test(html)) throw new Error(`a placeholder is left in ${file}`);
  fs.mkdirSync(path.dirname(path.join(ROOT, file)), { recursive: true });
  fs.writeFileSync(path.join(ROOT, file), html);
  console.log(file);
}

page('g/index.html', {
  LANG: 'ru', DESIGN: 'any', THEME: THEME.any,
  TITLE: 'Вам подарок · Сізге сыйлық · Teri',
  DESC: 'Откройте открытку с пожеланием и подарочным сертификатом Teri. Тілегі мен Teri сыйлық сертификаты бар ашықхатты ашыңыз.',
  IMAGE: `${SITE}/g/og/gift.jpg?v=${version}`, ALT: 'Конверт с открыткой Teri · Teri ашықхаты салынған конверт',
});
for (const lang of ['ru', 'kk']) {
  for (const design of Object.keys(THEME)) {
    page(`g/${lang}/${design}/index.html`, {
      LANG: lang, DESIGN: design, THEME: THEME[design],
      TITLE: `${TITLE[lang][design]} · Teri`, DESC: DESC[lang],
      IMAGE: `${SITE}/g/og/${lang}-${design}.jpg?v=${version}`, ALT: ALT[lang],
    });
  }
}
console.log('version', version);
