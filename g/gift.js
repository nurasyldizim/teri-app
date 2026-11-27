/* Teri: a gift card (27 Nov 2026, redesign of Step 53's page). …/g/<lang>/<design>/?t=<token>
   (the older …/g/?t=<token> works the same). The card comes from the database (gift_card_view, with
   the app's publishable key, as in the app): the occasion, to whom, from whom, the wishes, the amount,
   and the code while the certificate can still be activated.
   A sealed envelope first; a tap on the wax seal opens it and the card comes out. The code stays
   hidden until she taps it, is hidden again when she leaves the page, and is never on the picture
   for stories (no amount there either, and no link to this page). «Активировать в Teri» opens
   teri://gift/<token>: the app shows the gift and activates it. */
(function () {
  'use strict';

  var SUPABASE_URL = 'https://czoqtfpljmfhczwvqyfh.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_ZJZq3Ja1BYEUalUcIYGS4g_tq31fFUC';
  var PLAY_LIVE = false; // Google Play: set to true when Teri is public there (also in ../go, ../i, ../p)
  var APPSTORE = 'https://apps.apple.com/kz/app/id6825749281';
  var PLAY = 'https://play.google.com/store/apps/details?id=kz.teri.app';
  var GO = 'https://nurasyldizim.github.io/teri-app/go/?c=gift';
  var ICON = '/teri-app/icon.png';
  var DESIGNS = ['birthday', 'newyear', 'march8', 'thanks', 'any'];

  // the occasions' drawings, the same as in the app (src/lib/occasion-art.ts); classes for a little life
  var ART = {
    birthday: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\"><ellipse cx=\"32\" cy=\"54\" rx=\"23\" ry=\"3.2\" fill=\"#3A1F17\" opacity=\"0.10\"/><path d=\"M12 33h40v16a4 4 0 0 1-4 4H16a4 4 0 0 1-4-4z\" fill=\"#FFC9B5\"/><path d=\"M12 43h40v4H12z\" fill=\"#FFE9DC\"/><path d=\"M12 34c0-3.3 2.7-6 6-6h28c3.3 0 6 2.7 6 6v3.5c0 1.6-1.3 2.8-2.8 2.8s-2.8-1.2-2.8-2.8V36c0-1-.8-1.8-1.8-1.8s-1.8.8-1.8 1.8v4.2c0 1.6-1.3 2.8-2.8 2.8s-2.8-1.2-2.8-2.8V36c0-1-.8-1.8-1.8-1.8s-1.8.8-1.8 1.8v1.6c0 1.6-1.3 2.8-2.8 2.8s-2.8-1.2-2.8-2.8V36c0-1-.8-1.8-1.8-1.8S20.6 35 20.6 36v5.2c0 1.6-1.3 2.8-2.8 2.8S15 42.8 15 41.2V36c0-1-.8-1.8-1.5-1.8z\" fill=\"#E2603F\"/><rect x=\"20.5\" y=\"17\" width=\"3\" height=\"11\" rx=\"1.5\" fill=\"#F7B29C\"/><rect x=\"30.5\" y=\"14\" width=\"3\" height=\"14\" rx=\"1.5\" fill=\"#F7B29C\"/><rect x=\"40.5\" y=\"17\" width=\"3\" height=\"11\" rx=\"1.5\" fill=\"#F7B29C\"/><path class=\"fl\" d=\"M22 9.5c1.9 2.4 2.9 4.1 2.9 5.4a2.9 2.9 0 0 1-5.8 0c0-1.3 1-3 2.9-5.4z\" fill=\"#F4B740\"/><path class=\"fl\" d=\"M32 6.5c1.9 2.4 2.9 4.1 2.9 5.4a2.9 2.9 0 0 1-5.8 0c0-1.3 1-3 2.9-5.4z\" fill=\"#F4B740\"/><path class=\"fl\" d=\"M42 9.5c1.9 2.4 2.9 4.1 2.9 5.4a2.9 2.9 0 0 1-5.8 0c0-1.3 1-3 2.9-5.4z\" fill=\"#F4B740\"/><g stroke-linecap=\"round\" stroke-width=\"1.8\"><path d=\"M19 48.5l2-1\" stroke=\"#E2603F\"/><path d=\"M27 49.5l1.6 1.2\" stroke=\"#7A4FD1\"/><path d=\"M36 48.4l2 .4\" stroke=\"#4E7A27\"/><path d=\"M45 49.6l-1.4 1.3\" stroke=\"#E2603F\"/></g></svg>",
    newyear: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\"><ellipse cx=\"32\" cy=\"55\" rx=\"18\" ry=\"3\" fill=\"#14281F\" opacity=\"0.10\"/><rect x=\"29\" y=\"47\" width=\"6\" height=\"8\" rx=\"1.5\" fill=\"#8A5A3B\"/><path d=\"M32 26L49 47H15z\" fill=\"#1F5E49\" stroke=\"#1F5E49\" stroke-width=\"4\" stroke-linejoin=\"round\"/><path d=\"M32 17L45 35H19z\" fill=\"#2B7458\" stroke=\"#2B7458\" stroke-width=\"4\" stroke-linejoin=\"round\"/><path d=\"M32 10L41 24H23z\" fill=\"#3A8C6A\" stroke=\"#3A8C6A\" stroke-width=\"4\" stroke-linejoin=\"round\"/><path d=\"M21 33.5c6 3 15 3 22-1.5\" fill=\"none\" stroke=\"#E9C46A\" stroke-width=\"1.6\" stroke-linecap=\"round\"/><path d=\"M18 44.5c8 3.6 20 3.6 29-1.4\" fill=\"none\" stroke=\"#E9C46A\" stroke-width=\"1.6\" stroke-linecap=\"round\"/><circle class=\"tw\" cx=\"25\" cy=\"27\" r=\"2.2\" fill=\"#E2603F\"/><circle class=\"tw\" cx=\"38.5\" cy=\"29\" r=\"2.2\" fill=\"#F4EEDC\"/><circle class=\"tw\" cx=\"29\" cy=\"39\" r=\"2.4\" fill=\"#F4EEDC\"/><circle class=\"tw\" cx=\"41\" cy=\"41\" r=\"2.4\" fill=\"#E2603F\"/><circle class=\"tw\" cx=\"22\" cy=\"41\" r=\"2.2\" fill=\"#C99A2E\"/><path class=\"tw\" d=\"M32.00 2.50 L33.70 6.65 L38.18 6.99 L34.76 9.90 L35.82 14.26 L32.00 11.90 L28.18 14.26 L29.24 9.90 L25.82 6.99 L30.30 6.65Z\" fill=\"#E9B949\" stroke=\"#C99A2E\" stroke-width=\"1\" stroke-linejoin=\"round\"/></svg>",
    march8: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\"><g class=\"sway\"><path d=\"M29.5 57c0-10-2-16-6.5-24\" fill=\"none\" stroke=\"#4E7A27\" stroke-width=\"2.6\" stroke-linecap=\"round\"/><path d=\"M29.8 52c-8-1.5-12.5-7.5-13-14 7 1.5 11.5 6.5 13 14z\" fill=\"#6E9F3D\"/><path d=\"M15 19.5c0-3.8 1.6-6.4 3.4-7.4 1 2.6 2.8 4 4.6 4s3.6-1.4 4.6-4c1.8 1 3.4 3.6 3.4 7.4 0 7.4-3.6 12.5-8 12.5s-8-5.1-8-12.5z\" fill=\"#D9466F\"/><path d=\"M23 15.6c-2.9 2.6-4.3 6.5-4 10.6.3 3.2 1.8 5.6 4 5.8 2.2-.2 3.7-2.6 4-5.8.3-4.1-1.1-8-4-10.6z\" fill=\"#B8355A\"/></g><g class=\"sway\"><path d=\"M34.5 57c0-10 2-17 7.5-26\" fill=\"none\" stroke=\"#4E7A27\" stroke-width=\"2.6\" stroke-linecap=\"round\"/><path d=\"M34.2 50c8-1.5 12.5-7.5 13-14-7 1.5-11.5 6.5-13 14z\" fill=\"#8DBA5E\"/><path d=\"M33 17.5c0-4.2 1.8-7 3.8-8.1 1.1 2.9 3 4.4 5.2 4.4s4.1-1.5 5.2-4.4c2 1.1 3.8 3.9 3.8 8.1 0 8.2-4 13.8-9 13.8s-9-5.6-9-13.8z\" fill=\"#EC6F92\"/><path d=\"M42 13.2c-3.2 2.9-4.8 7.2-4.5 11.7.3 3.6 2 6.2 4.5 6.4 2.5-.2 4.2-2.8 4.5-6.4.3-4.5-1.3-8.8-4.5-11.7z\" fill=\"#D9466F\"/></g></svg>",
    thanks: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\"><path d=\"M21 31c-4.5-2.5-7-7.5-6.5-12.5 5 1.5 8.5 5.5 9 11\" fill=\"#6E9F3D\"/><path d=\"M43 31c4.5-2.5 7-7.5 6.5-12.5-5 1.5-8.5 5.5-9 11\" fill=\"#8DBA5E\"/><ellipse cx=\"22.5\" cy=\"19.10\" rx=\"2.70\" ry=\"4.50\" fill=\"#F7B6C8\" transform=\"rotate(0.0 22.5 24.5)\"/><ellipse cx=\"22.5\" cy=\"19.10\" rx=\"2.70\" ry=\"4.50\" fill=\"#F7B6C8\" transform=\"rotate(45.0 22.5 24.5)\"/><ellipse cx=\"22.5\" cy=\"19.10\" rx=\"2.70\" ry=\"4.50\" fill=\"#F7B6C8\" transform=\"rotate(90.0 22.5 24.5)\"/><ellipse cx=\"22.5\" cy=\"19.10\" rx=\"2.70\" ry=\"4.50\" fill=\"#F7B6C8\" transform=\"rotate(135.0 22.5 24.5)\"/><ellipse cx=\"22.5\" cy=\"19.10\" rx=\"2.70\" ry=\"4.50\" fill=\"#F7B6C8\" transform=\"rotate(180.0 22.5 24.5)\"/><ellipse cx=\"22.5\" cy=\"19.10\" rx=\"2.70\" ry=\"4.50\" fill=\"#F7B6C8\" transform=\"rotate(225.0 22.5 24.5)\"/><ellipse cx=\"22.5\" cy=\"19.10\" rx=\"2.70\" ry=\"4.50\" fill=\"#F7B6C8\" transform=\"rotate(270.0 22.5 24.5)\"/><ellipse cx=\"22.5\" cy=\"19.10\" rx=\"2.70\" ry=\"4.50\" fill=\"#F7B6C8\" transform=\"rotate(315.0 22.5 24.5)\"/><circle cx=\"22.5\" cy=\"24.5\" r=\"3.24\" fill=\"#F4B740\"/><ellipse cx=\"41.5\" cy=\"19.10\" rx=\"2.70\" ry=\"4.50\" fill=\"#F7B6C8\" transform=\"rotate(0.0 41.5 24.5)\"/><ellipse cx=\"41.5\" cy=\"19.10\" rx=\"2.70\" ry=\"4.50\" fill=\"#F7B6C8\" transform=\"rotate(45.0 41.5 24.5)\"/><ellipse cx=\"41.5\" cy=\"19.10\" rx=\"2.70\" ry=\"4.50\" fill=\"#F7B6C8\" transform=\"rotate(90.0 41.5 24.5)\"/><ellipse cx=\"41.5\" cy=\"19.10\" rx=\"2.70\" ry=\"4.50\" fill=\"#F7B6C8\" transform=\"rotate(135.0 41.5 24.5)\"/><ellipse cx=\"41.5\" cy=\"19.10\" rx=\"2.70\" ry=\"4.50\" fill=\"#F7B6C8\" transform=\"rotate(180.0 41.5 24.5)\"/><ellipse cx=\"41.5\" cy=\"19.10\" rx=\"2.70\" ry=\"4.50\" fill=\"#F7B6C8\" transform=\"rotate(225.0 41.5 24.5)\"/><ellipse cx=\"41.5\" cy=\"19.10\" rx=\"2.70\" ry=\"4.50\" fill=\"#F7B6C8\" transform=\"rotate(270.0 41.5 24.5)\"/><ellipse cx=\"41.5\" cy=\"19.10\" rx=\"2.70\" ry=\"4.50\" fill=\"#F7B6C8\" transform=\"rotate(315.0 41.5 24.5)\"/><circle cx=\"41.5\" cy=\"24.5\" r=\"3.24\" fill=\"#F4B740\"/><ellipse cx=\"32\" cy=\"10.50\" rx=\"3.00\" ry=\"5.00\" fill=\"#FFFFFF\" transform=\"rotate(0.0 32 16.5)\"/><ellipse cx=\"32\" cy=\"10.50\" rx=\"3.00\" ry=\"5.00\" fill=\"#FFFFFF\" transform=\"rotate(36.0 32 16.5)\"/><ellipse cx=\"32\" cy=\"10.50\" rx=\"3.00\" ry=\"5.00\" fill=\"#FFFFFF\" transform=\"rotate(72.0 32 16.5)\"/><ellipse cx=\"32\" cy=\"10.50\" rx=\"3.00\" ry=\"5.00\" fill=\"#FFFFFF\" transform=\"rotate(108.0 32 16.5)\"/><ellipse cx=\"32\" cy=\"10.50\" rx=\"3.00\" ry=\"5.00\" fill=\"#FFFFFF\" transform=\"rotate(144.0 32 16.5)\"/><ellipse cx=\"32\" cy=\"10.50\" rx=\"3.00\" ry=\"5.00\" fill=\"#FFFFFF\" transform=\"rotate(180.0 32 16.5)\"/><ellipse cx=\"32\" cy=\"10.50\" rx=\"3.00\" ry=\"5.00\" fill=\"#FFFFFF\" transform=\"rotate(216.0 32 16.5)\"/><ellipse cx=\"32\" cy=\"10.50\" rx=\"3.00\" ry=\"5.00\" fill=\"#FFFFFF\" transform=\"rotate(252.0 32 16.5)\"/><ellipse cx=\"32\" cy=\"10.50\" rx=\"3.00\" ry=\"5.00\" fill=\"#FFFFFF\" transform=\"rotate(288.0 32 16.5)\"/><ellipse cx=\"32\" cy=\"10.50\" rx=\"3.00\" ry=\"5.00\" fill=\"#FFFFFF\" transform=\"rotate(324.0 32 16.5)\"/><circle cx=\"32\" cy=\"16.5\" r=\"3.60\" fill=\"#F4B740\"/><path d=\"M14.5 30.5h35L33.6 58h-3.2z\" fill=\"#A3CB75\"/><path d=\"M32 30.5h17.5L33.6 58H32z\" fill=\"#8DBA5E\"/><path d=\"M29 44c-3.6-3-7.8-2.8-8.4 0-.4 2.5 3.6 3.8 8.4 0zm6 0c3.6-3 7.8-2.8 8.4 0 .4 2.5-3.6 3.8-8.4 0z\" fill=\"#4E7A27\"/><circle cx=\"32\" cy=\"44.1\" r=\"2.5\" fill=\"#36561A\"/><path class=\"tw\" d=\"M9.5 8.4 C10.148 11.352 10.148 11.352 13.1 12 C10.148 12.648 10.148 12.648 9.5 15.6 C8.852 12.648 8.852 12.648 5.9 12 C8.852 11.352 8.852 11.352 9.5 8.4Z\" fill=\"#F4B740\"/><path class=\"tw\" d=\"M55 6 C55.54 8.46 55.54 8.46 58 9 C55.54 9.54 55.54 9.54 55 12 C54.46 9.54 54.46 9.54 52 9 C54.46 8.46 54.46 8.46 55 6Z\" fill=\"#A3CB75\"/><path class=\"tw\" d=\"M57.5 30.6 C57.932 32.568 57.932 32.568 59.9 33 C57.932 33.432 57.932 33.432 57.5 35.4 C57.068 33.432 57.068 33.432 55.1 33 C57.068 32.568 57.068 32.568 57.5 30.6Z\" fill=\"#F4B740\"/></svg>",
    any: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\"><g class=\"beat\"><path d=\"M32 53C19.5 45 11.5 36.5 11.5 26.6 11.5 19.6 16.6 14.5 23.2 14.5c4 0 7 2 8.8 5 1.8-3 4.8-5 8.8-5 6.6 0 11.7 5.1 11.7 12.1C52.5 36.5 44.5 45 32 53z\" fill=\"#7A4FD1\"/><path d=\"M18.5 25.5c0-3.4 2.3-5.8 5.3-5.8\" fill=\"none\" stroke=\"#FFFFFF\" stroke-width=\"2.6\" stroke-linecap=\"round\" opacity=\"0.55\"/></g><path class=\"tw\" d=\"M51 6.5 C51.99 11.01 51.99 11.01 56.5 12 C51.99 12.99 51.99 12.99 51 17.5 C50.01 12.99 50.01 12.99 45.5 12 C50.01 11.01 50.01 11.01 51 6.5Z\" fill=\"#B79CF0\"/><path class=\"tw\" d=\"M12.5 41 C13.22 44.28 13.22 44.28 16.5 45 C13.22 45.72 13.22 45.72 12.5 49 C11.78 45.72 11.78 45.72 8.5 45 C11.78 44.28 11.78 44.28 12.5 41Z\" fill=\"#B79CF0\"/><path class=\"tw\" d=\"M55 27 C55.54 29.46 55.54 29.46 58 30 C55.54 30.54 55.54 30.54 55 33 C54.46 30.54 54.46 30.54 52 30 C54.46 29.46 54.46 29.46 55 27Z\" fill=\"#D9C9FA\"/></svg>"
  };

  var T = {
    ru: {
      loading: 'Открываем открытку…',
      over: 'Открытка',
      titleName: ['{name},', 'вам подарок'], title: ['Вам', 'подарок'],
      from: '{name} присылает открытку',
      tap: 'Нажмите на печать', open: 'Открыть подарок', seal: 'Открыть конверт',
      greet: { birthday: 'С днём рождения!', newyear: 'С Новым годом!', march8: 'С 8 Марта!', thanks: 'Спасибо!', any: 'Это вам!' },
      greetAfter: { birthday: 'с днём рождения!', newyear: 'с Новым годом!', march8: 'с 8 Марта!', thanks: 'спасибо!', any: 'это вам!' },
      wish: {
        birthday: 'Пусть кожа сияет, а каждое утро начинается с любимого ухода.',
        newyear: 'Пусть новый год будет полон заботы о себе и радостных моментов.',
        march8: 'Пусть весна дарит радость, а уход — сияние.',
        thanks: 'Это маленький знак большой благодарности.',
        any: 'Просто так — чтобы порадовать. Пусть уход будет в удовольствие.'
      },
      certificate: 'Подарочный сертификат',
      codeLabel: 'Код сертификата', reveal: 'Показать код', hide: 'Скрыть', copy: 'Скопировать', copied: 'Скопировано',
      lock: 'Код видите только вы. Не показывайте его в сторис и не пересылайте эту ссылку.',
      lockPhone: 'Активировать можно только с номера, который заканчивается на {hint}.',
      activate: 'Активировать в Teri', openApp: 'Открыть Teri', share: 'Поделиться в сторис',
      noApp: 'Ещё нет Teri?', playSoon: 'Google Play — скоро',
      howTitle: 'Как получить подарок',
      step1: 'Скачайте Teri в App Store.', step1Play: 'Скачайте Teri в App Store или Google Play.',
      step1Android: 'Teri для Android скоро появится в Google Play — сохраните эту ссылку, подарок вас дождётся. На iPhone Teri уже в App Store.',
      noAppYet: 'Если Teri не открылся, сначала скачайте его, а потом вернитесь к этой открытке.',
      step2: 'Вернитесь к этой открытке и нажмите «Активировать в Teri». Войдите через Apple или Google.',
      step3Name: '{name} подтвердит активацию — и сумма появится на вашем счёте в Teri.',
      step3Anon: 'Отправитель подтвердит активацию — и сумма появится на вашем счёте в Teri.',
      step3Now: 'Сумма сразу появится на вашем счёте в Teri.',
      step4: 'Сделайте селфи: Teri подберёт уход под вашу кожу, а сертификат оплатит заказ.',
      note: 'Сертификат не сгорает, сумму можно тратить частями.',
      again: 'Открыть заново',
      redeemed: 'Подарок уже активирован', redeemedText: 'Сумма на счёте в Teri — откройте приложение, чтобы выбрать уход.',
      cancelled: 'Этот сертификат больше не действует. Напишите тому, кто его подарил.',
      notFound: 'Открытка не найдена. Проверьте ссылку или попросите прислать её ещё раз.',
      error: 'Не удалось загрузить открытку. Проверьте интернет и попробуйте ещё раз.',
      retry: 'Обновить',
      shareTitle: 'Поделитесь радостью', shareSub: 'На картинке нет кода и суммы — делитесь спокойно.',
      shareWish: 'Пожелание на картинке', shareNow: 'Поделиться', save: 'Сохранить картинку', close: 'Закрыть',
      holdHint: 'Если кнопка не сработала, нажмите на картинку и удерживайте, чтобы сохранить.',
      shareText: 'Мне подарили открытку Teri. Корейский уход, подобранный по селфи:',
      storyGift: 'Подарочный сертификат Teri', storyTag: 'Корейский уход по селфи',
      picture: 'Картинка для сторис'
    },
    kk: {
      loading: 'Ашықхатты ашып жатырмыз…',
      over: 'Ашықхат',
      titleName: ['{name},', 'сізге сыйлық'], title: ['Сізге', 'сыйлық'],
      from: '{name} сізге ашықхат жолдады',
      tap: 'Мөрді басыңыз', open: 'Сыйлықты ашу', seal: 'Конвертті ашу',
      greet: { birthday: 'Туған күніңізбен!', newyear: 'Жаңа жылыңызбен!', march8: '8 наурыз мерекесімен!', thanks: 'Рахмет!', any: 'Бұл — сізге!' },
      greetAfter: { birthday: 'туған күніңізбен!', newyear: 'Жаңа жылыңызбен!', march8: '8 наурыз мерекесімен!', thanks: 'рахмет!', any: 'бұл — сізге!' },
      wish: {
        birthday: 'Теріңіз жарқырап, әр таңыңыз сүйікті күтімнен басталсын.',
        newyear: 'Жаңа жыл өзіңізге деген қамқорлық пен қуанышқа толы болсын.',
        march8: 'Көктем қуаныш, ал күтім жарқырау сыйласын.',
        thanks: 'Бұл — үлкен алғысымның кішкентай белгісі.',
        any: 'Жай ғана — сізді қуантқым келді. Күтім ләззат сыйласын.'
      },
      certificate: 'Сыйлық сертификаты',
      codeLabel: 'Сертификат коды', reveal: 'Кодты көрсету', hide: 'Жасыру', copy: 'Көшіру', copied: 'Көшірілді',
      lock: 'Кодты тек сіз көресіз. Оны стористе көрсетпеңіз және бұл сілтемені ешкімге жібермеңіз.',
      lockPhone: 'Тек соңы {hint} болатын нөмірден іске қосуға болады.',
      activate: 'Teri-де іске қосу', openApp: 'Teri-ді ашу', share: 'Стористе бөлісу',
      noApp: 'Teri әлі жоқ па?', playSoon: 'Google Play — жақында',
      howTitle: 'Сыйлықты қалай алуға болады',
      step1: 'Teri-ді App Store-дан жүктеңіз.', step1Play: 'Teri-ді App Store-дан не Google Play-ден жүктеңіз.',
      step1Android: 'Android-қа арналған Teri жақында Google Play-де болады — осы сілтемені сақтап қойыңыз, сыйлық сізді күтеді. iPhone-да Teri App Store-да бар.',
      noAppYet: 'Teri ашылмаса, алдымен оны жүктеп алыңыз, сосын осы ашықхатқа оралыңыз.',
      step2: 'Осы ашықхатқа оралып, «Teri-де іске қосу» батырмасын басыңыз. Apple не Google арқылы кіріңіз.',
      step3Name: '{name} іске қосуды растайды — сосын сома Teri-дегі шотыңызға түседі.',
      step3Anon: 'Жіберуші іске қосуды растайды — сосын сома Teri-дегі шотыңызға түседі.',
      step3Now: 'Сома бірден Teri-дегі шотыңызға түседі.',
      step4: 'Селфи жасаңыз: Teri теріңізге сай күтімді таңдайды, ал сертификат тапсырысты төлейді.',
      note: 'Сертификат күймейді, соманы бөліп жұмсауға болады.',
      again: 'Қайта ашу',
      redeemed: 'Сыйлық іске қосылған', redeemedText: 'Сома Teri-дегі шотта — күтімді таңдау үшін қосымшаны ашыңыз.',
      cancelled: 'Бұл сертификат енді жарамсыз. Оны сыйлаған адамға жазыңыз.',
      notFound: 'Ашықхат табылмады. Сілтемені тексеріңіз немесе оны қайта жіберуді сұраңыз.',
      error: 'Ашықхатты жүктеу мүмкін болмады. Интернетті тексеріп, қайталап көріңіз.',
      retry: 'Жаңарту',
      shareTitle: 'Қуанышыңызбен бөлісіңіз', shareSub: 'Суретте код та, сома да жоқ — алаңсыз бөлісе беріңіз.',
      shareWish: 'Тілек суретте көрінсін', shareNow: 'Бөлісу', save: 'Суретті сақтау', close: 'Жабу',
      holdHint: 'Батырма жұмыс істемесе, суретті басып тұрып сақтаңыз.',
      shareText: 'Маған Teri ашықхатын сыйлады. Селфи бойынша таңдалған корей күтімі:',
      storyGift: 'Teri сыйлық сертификаты', storyTag: 'Селфи бойынша корей күтімі',
      picture: 'Сторис үшін сурет'
    }
  };

  // drawn icons, one style (the app's icons.tsx)
  function icon(d, extra) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"' + (extra || '') + '>' + d + '</svg>';
  }
  var I = {
    up: icon('<path d="M12 19V6"/><path d="M6.5 11.5L12 6l5.5 5.5"/>'),
    share: icon('<path d="M12 3.5v11"/><path d="M8 7.5l4-4 4 4"/><path d="M6.5 11H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5"/>'),
    copy: icon('<rect x="9" y="9" width="11" height="11" rx="2.4"/><path d="M15 9V6.4A2.4 2.4 0 0 0 12.6 4H6.4A2.4 2.4 0 0 0 4 6.4v6.2A2.4 2.4 0 0 0 6.4 15H9"/>'),
    eye: icon('<path d="M2.5 12s3.5-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.5 6.5-9.5 6.5S2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.8"/>'),
    eyeOff: icon('<path d="M4 4l16 16"/><path d="M9.6 5.9A9.8 9.8 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a15 15 0 0 1-2.7 3.4M6.4 7.6A15 15 0 0 0 2.5 12s3.5 6.5 9.5 6.5a9.3 9.3 0 0 0 4.2-1"/><path d="M10 10.2a2.8 2.8 0 0 0 3.8 3.8"/>'),
    lock: icon('<rect x="5" y="11" width="14" height="10" rx="2.4"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'),
    check: icon('<circle cx="12" cy="12" r="9"/><path d="M8 12.4l2.7 2.7L16.2 9.6"/>'),
    down: icon('<path d="M12 4v11"/><path d="M7 10.5l5 5 5-5"/><path d="M5 20h14"/>'),
    again: icon('<path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3"/><path d="M4.5 4.5v4h4"/>'),
    close: icon('<path d="M6 6l12 12M18 6L6 18"/>')
  };

  var $ = function (id) { return document.getElementById(id); };
  var q = new URLSearchParams(location.search);
  var token = (q.get('t') || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  var demo = (q.get('demo') || '').toLowerCase();
  if (DESIGNS.indexOf(demo) < 0) demo = '';
  var card = null, lang = 'ru', design = document.body.getAttribute('data-design') || 'any', state = 'loading', problem = null;
  var ANDROID = /Android/i.test(navigator.userAgent || '');
  var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  if (DESIGNS.indexOf(design) < 0) design = 'any';

  function fill(s, name) { return String(s).split('{name}').join(name); }
  function money(n) { return String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₸'; }
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } return null; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function anim(el, frames, opts) {
    if (!el || !el.animate) return Promise.resolve();
    var a = el.animate(frames, Object.assign({ fill: 'forwards' }, opts));
    return a.finished ? a.finished.catch(function () {}) : wait(opts.duration + (opts.delay || 0));
  }
  function t() { return T[lang]; }

  // a soft tap on the phone: Android vibrates; on an iPhone (iOS 18+) a switch toggled from a tap ticks
  function haptic() {
    try { if (navigator.vibrate) navigator.vibrate([10, 30, 14]); } catch (e) {}
    try {
      if (!/iPhone|iPad/.test(navigator.userAgent)) return;
      var label = document.createElement('label'), input = document.createElement('input');
      label.setAttribute('aria-hidden', 'true'); label.style.display = 'none';
      input.type = 'checkbox'; input.setAttribute('switch', '');
      label.appendChild(input); document.head.appendChild(label); label.click(); document.head.removeChild(label);
    } catch (e) {}
  }

  /* ---------- the envelope ---------- */
  function sealSvg() {
    // a wax drop with an uneven edge, pressed with Teri's drop in the middle
    var pts = [], n = 18, cx = 40, cy = 40;
    for (var i = 0; i < n; i++) {
      var a = (i / n) * Math.PI * 2, r = 33 + Math.sin(i * 2.7) * 1.8 + Math.cos(i * 1.3) * 1.2;
      pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
    var d = '';
    for (var k = 0; k < n; k++) {
      var p = pts[k], nx = pts[(k + 1) % n], m = [(p[0] + nx[0]) / 2, (p[1] + nx[1]) / 2];
      d += (k === 0 ? 'M' + ((pts[n - 1][0] + p[0]) / 2).toFixed(2) + ' ' + ((pts[n - 1][1] + p[1]) / 2).toFixed(2) : '') +
        ' Q' + p[0].toFixed(2) + ' ' + p[1].toFixed(2) + ' ' + m[0].toFixed(2) + ' ' + m[1].toFixed(2);
    }
    var drop = 'M40 26.5C40 26.5 31.2 37.6 31.2 43.6a8.8 8.8 0 0 0 17.6 0C48.8 37.6 40 26.5 40 26.5z';
    return '<svg viewBox="0 0 80 80" aria-hidden="true"><defs>' +
      '<radialGradient id="wx" cx="38%" cy="30%" r="78%"><stop offset="0" style="stop-color:var(--seal-hi)"/><stop offset=".55" style="stop-color:var(--seal)"/><stop offset="1" style="stop-color:var(--seal-lo)"/></radialGradient>' +
      '<radialGradient id="wi" cx="60%" cy="70%" r="80%"><stop offset="0" style="stop-color:var(--seal-hi)"/><stop offset=".7" style="stop-color:var(--seal)"/></radialGradient>' +
      '</defs><path d="' + d + 'Z" fill="url(#wx)"/>' +
      '<circle cx="40" cy="40" r="24" fill="url(#wi)"/>' +
      '<circle cx="40" cy="40" r="24" fill="none" stroke="rgba(0,0,0,.22)" stroke-width="1.6"/>' +
      '<circle cx="40" cy="40.8" r="24" fill="none" stroke="rgba(255,255,255,.22)" stroke-width="1" />' +
      '<path d="' + drop + '" fill="rgba(0,0,0,.28)" transform="translate(0 1.2)"/>' +
      '<path d="' + drop + '" fill="rgba(255,255,255,.32)" transform="translate(0 -1)"/>' +
      '<path d="' + drop + '" style="fill:var(--seal)"/>' +
      '<ellipse cx="29" cy="25" rx="7" ry="3.2" fill="rgba(255,255,255,.28)" transform="rotate(-32 29 25)"/></svg>';
  }
  function pocketSvg() {
    return '<svg viewBox="0 0 300 200" preserveAspectRatio="none" aria-hidden="true">' +
      '<path d="M0 0 L143 103 Q150 108 143 113 L0 200 Z" style="fill:var(--env-side)"/>' +
      '<path d="M300 0 L157 103 Q150 108 157 113 L300 200 Z" style="fill:var(--env-side)"/>' +
      '<path d="M0 200 L140 97 Q150 90 160 97 L300 200 Z" style="fill:var(--env-low)"/>' +
      '<path d="M0 200 L140 97 Q150 90 160 97 L300 200" fill="none" style="stroke:var(--env-edge)" stroke-width="1.1"/>' +
      '<path d="M0 0 L143 103 Q150 108 143 113 M300 0 L157 103 Q150 108 157 113" fill="none" style="stroke:var(--env-edge)" stroke-width=".8" opacity=".7"/>' +
      '</svg>';
  }
  // the flap: paper outside with a thin foil edge, the patterned lining inside
  function flapSvg() {
    var v = 'M0 7 Q0 0 7 0 H293 Q300 0 300 7 L158.5 110.5 Q150 117 141.5 110.5 Z';
    var edge = 'M1.5 6.5 L141.5 108.5 Q150 115 158.5 108.5 L298.5 6.5';
    return '<svg class="flap-face" viewBox="0 0 300 117" preserveAspectRatio="none" aria-hidden="true"><defs>' +
      '<linearGradient id="ff" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--env-a)"/><stop offset="1" style="stop-color:var(--env-side)"/></linearGradient>' +
      '<linearGradient id="fe" x1="0" y1="0" x2="1" y2="0"><stop offset="0" style="stop-color:var(--foil)" stop-opacity=".35"/><stop offset=".5" style="stop-color:var(--foil)"/><stop offset="1" style="stop-color:var(--foil)" stop-opacity=".35"/></linearGradient>' +
      '</defs><path d="' + v + '" fill="url(#ff)"/>' +
      '<path d="' + edge + '" fill="none" stroke="url(#fe)" stroke-width="1.6" stroke-linejoin="round"/>' +
      '<path d="' + edge + '" fill="none" stroke="rgba(255,255,255,.55)" stroke-width=".6" transform="translate(0 -1.4)"/></svg>' +
      '<svg class="flap-liner" viewBox="0 0 300 117" preserveAspectRatio="none" aria-hidden="true"><defs>' +
      '<linearGradient id="fl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:var(--liner-a)"/><stop offset="1" style="stop-color:var(--liner-b)"/></linearGradient>' +
      '<pattern id="fp" width="13" height="13" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1.3" fill="rgba(255,255,255,.45)"/><circle cx="9.5" cy="9.5" r=".9" fill="rgba(255,255,255,.3)"/></pattern>' +
      '</defs><g transform="translate(0 117) scale(1 -1)"><path d="' + v + '" fill="url(#fl)"/><path d="' + v + '" fill="url(#fp)"/>' +
      '<path d="' + edge + '" fill="none" stroke="rgba(255,255,255,.6)" stroke-width="1.2"/></g></svg>';
  }
  function buildEnvelope() {
    $('envCard').innerHTML = ART[design] + '<i></i><i></i>';
    $('pocket').innerHTML = pocketSvg();
    $('flap').innerHTML = flapSvg();
    $('seal').innerHTML = sealSvg();
  }

  /* ---------- particles: drifting in the room, and a burst when the card comes out ---------- */
  var KINDS = {
    birthday: { drift: 'down', shapes: ['conf', 'conf', 'dot'], colors: ['#E2603F', '#FFB547', '#6CC3B1', '#F58BA8', '#8E68DA', '#FFD36E'] },
    newyear: { drift: 'down', shapes: ['snow', 'snow', 'snow', 'spark'], colors: ['#FFFFFF', '#FFFFFF', '#F6E3A6', '#E7C46E'] },
    march8: { drift: 'down', shapes: ['petal', 'petal', 'petal', 'dot'], colors: ['#F28CAB', '#D9466F', '#FFC2D6', '#F7B6C8', '#FFFFFF'] },
    thanks: { drift: 'down', shapes: ['leaf', 'leaf', 'petal', 'dot'], colors: ['#6E9F3D', '#8DBA5E', '#A3CB75', '#FFFFFF', '#F4B740'] },
    any: { drift: 'up', shapes: ['heart', 'heart', 'spark', 'dot'], colors: ['#8E68DA', '#B79CF0', '#F28CAB', '#FFD36E', '#FFFFFF'] }
  };
  function drawShape(ctx, shape, s, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    if (shape === 'conf') { ctx.rect(-s, -s * 0.45, s * 2, s * 0.9); }
    else if (shape === 'dot') { ctx.arc(0, 0, s * 0.55, 0, Math.PI * 2); }
    else if (shape === 'snow') { ctx.arc(0, 0, s * 0.6, 0, Math.PI * 2); }
    else if (shape === 'petal') { ctx.ellipse(0, 0, s, s * 0.52, 0, 0, Math.PI * 2); }
    else if (shape === 'leaf') {
      ctx.moveTo(-s * 1.1, 0); ctx.quadraticCurveTo(0, -s * 0.9, s * 1.1, 0); ctx.quadraticCurveTo(0, s * 0.9, -s * 1.1, 0);
    } else if (shape === 'heart') {
      var h = s * 1.1;
      ctx.moveTo(0, h * 0.35);
      ctx.bezierCurveTo(-h * 1.1, -h * 0.35, -h * 0.45, -h * 1.05, 0, -h * 0.45);
      ctx.bezierCurveTo(h * 0.45, -h * 1.05, h * 1.1, -h * 0.35, 0, h * 0.35);
    } else if (shape === 'spark') {
      var r = s * 1.2, k = r * 0.2;
      ctx.moveTo(0, -r); ctx.quadraticCurveTo(k, -k, r, 0); ctx.quadraticCurveTo(k, k, 0, r);
      ctx.quadraticCurveTo(-k, k, -r, 0); ctx.quadraticCurveTo(-k, -k, 0, -r);
    }
    ctx.fill();
  }
  function fitCanvas(c) {
    var dpr = Math.min(window.devicePixelRatio || 1, 2), w = innerWidth, h = innerHeight;
    c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
    var ctx = c.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx: ctx, w: w, h: h };
  }
  var ambient = { run: false, parts: [], raf: 0 };
  function ambientStart() {
    var c = $('ambient');
    if (reduce || !c.getContext) { c.hidden = true; return; }
    var k = KINDS[design], f = fitCanvas(c);
    var n = innerWidth > 700 ? 26 : 15;
    ambient.parts = [];
    for (var i = 0; i < n; i++) ambient.parts.push(newDrift(k, f, true));
    ambient.f = f; ambient.k = k;
    if (!ambient.run) { ambient.run = true; ambient.last = 0; ambient.raf = requestAnimationFrame(ambientFrame); }
  }
  function newDrift(k, f, anywhere) {
    var up = k.drift === 'up';
    return {
      x: Math.random() * f.w,
      y: anywhere ? Math.random() * f.h : (up ? f.h + 20 : -20),
      s: 3 + Math.random() * 4.5, rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.02,
      vy: (up ? -1 : 1) * (0.18 + Math.random() * 0.32), sway: 0.6 + Math.random() * 1.2, ph: Math.random() * 6.28,
      a: 0.35 + Math.random() * 0.4,
      shape: k.shapes[Math.floor(Math.random() * k.shapes.length)], color: k.colors[Math.floor(Math.random() * k.colors.length)]
    };
  }
  function ambientFrame(now) {
    if (!ambient.run) return;
    var dt = ambient.last ? Math.min(3, (now - ambient.last) / 16.7) : 1; ambient.last = now;
    var f = ambient.f, ctx = f.ctx;
    ctx.clearRect(0, 0, f.w, f.h);
    for (var i = 0; i < ambient.parts.length; i++) {
      var p = ambient.parts[i];
      p.ph += 0.012 * dt; p.y += p.vy * dt; p.x += Math.sin(p.ph) * 0.25 * p.sway * dt; p.rot += p.vr * dt;
      if (p.y > f.h + 30 || p.y < -30) ambient.parts[i] = newDrift(ambient.k, f, false);
      ctx.save(); ctx.globalAlpha = p.a; ctx.translate(p.x, p.y); ctx.rotate(p.rot); drawShape(ctx, p.shape, p.s, p.color); ctx.restore();
    }
    ambient.raf = requestAnimationFrame(ambientFrame);
  }
  function ambientStop() { ambient.run = false; cancelAnimationFrame(ambient.raf); }
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { ambientStop(); hideCode(); } else if (state !== 'loading' && state !== 'problem') ambientStart();
  });
  window.addEventListener('resize', function () { if (ambient.run) { ambient.f = fitCanvas($('ambient')); } });

  function burst(ox, oy) {
    var c = $('burst');
    if (reduce || !c.getContext) return;
    var f = fitCanvas(c), ctx = f.ctx, k = KINDS[design], parts = [];
    c.hidden = false;
    for (var i = 0; i < 150; i++) {
      var a = -Math.PI / 2 + (Math.random() - 0.5) * 1.7, v = 6 + Math.random() * 10;
      parts.push({ x: ox + (Math.random() - 0.5) * 60, y: oy, vx: Math.cos(a) * v, vy: Math.sin(a) * v, s: 3.5 + Math.random() * 4.5,
        rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.35, ph: Math.random() * 6.28,
        shape: k.shapes[i % k.shapes.length], color: k.colors[i % k.colors.length] });
    }
    var t0 = 0, last = 0;
    (function frame(now) {
      if (!t0) t0 = now;
      var dt = last ? Math.min(3, (now - last) / 16.7) : 1; last = now;
      var age = now - t0;
      ctx.clearRect(0, 0, f.w, f.h);
      ctx.globalAlpha = age > 2200 ? Math.max(0, 1 - (age - 2200) / 900) : 1;
      for (var j = 0; j < parts.length; j++) {
        var p = parts[j];
        p.vy += 0.22 * dt; p.vx *= Math.pow(0.985, dt); p.vy *= Math.pow(0.985, dt);
        p.ph += 0.08 * dt; p.x += (p.vx + Math.sin(p.ph) * 0.6) * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.scale(1, 0.55 + Math.abs(Math.sin(p.ph)) * 0.45);
        drawShape(ctx, p.shape, p.s, p.color); ctx.restore();
      }
      if (age < 3100) requestAnimationFrame(frame); else { ctx.clearRect(0, 0, f.w, f.h); c.hidden = true; }
    })(performance.now());
  }

  /* ---------- the hidden code: shimmering dust until she taps it ---------- */
  var dust = { on: false, parts: [], raf: 0, out: false };
  function dustStart() {
    var c = $('dust'), box = $('codeBox');
    if (!c || !c.getContext || !box) return;
    var r = box.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (!r.width) return;
    c.width = Math.round(r.width * dpr); c.height = Math.round(r.height * dpr);
    var ctx = c.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    dust.ctx = ctx; dust.w = r.width; dust.h = r.height; dust.out = false; dust.parts = [];
    var n = Math.round(r.width * r.height / 38);
    var ink = getComputedStyle(document.body).getPropertyValue('--ink').trim() || '#2B2140';
    dust.color = ink;
    for (var i = 0; i < n; i++) {
      dust.parts.push({ x: Math.random() * r.width, y: 6 + Math.random() * (r.height - 12), vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
        s: 0.9 + Math.random() * 1.0, a: 0.3 + Math.random() * 0.6, ph: Math.random() * 6.28 });
    }
    if (reduce) { dustDraw(1); return; }
    if (!dust.on) { dust.on = true; dust.last = 0; dust.raf = requestAnimationFrame(dustFrame); }
  }
  function dustDraw(dt) {
    var ctx = dust.ctx; if (!ctx) return;
    ctx.clearRect(0, 0, dust.w, dust.h);
    ctx.fillStyle = dust.color;
    var alive = 0;
    for (var i = 0; i < dust.parts.length; i++) {
      var p = dust.parts[i];
      if (dust.out) { p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 1.02; p.vy *= 1.02; p.a -= 0.022 * dt; }
      else {
        p.ph += 0.05 * dt; p.x += p.vx * dt; p.y += p.vy * dt;
        if (p.x < 0) p.x += dust.w; if (p.x > dust.w) p.x -= dust.w;
        if (p.y < 4 || p.y > dust.h - 4) p.vy = -p.vy;
      }
      if (p.a <= 0) continue;
      alive++;
      ctx.globalAlpha = Math.max(0, dust.out ? p.a : p.a * (0.55 + 0.45 * Math.sin(p.ph)));
      ctx.fillRect(p.x, p.y, p.s, p.s);
    }
    ctx.globalAlpha = 1;
    return alive;
  }
  function dustFrame(now) {
    if (!dust.on) return;
    var dt = dust.last ? Math.min(3, (now - dust.last) / 16.7) : 1; dust.last = now;
    var alive = dustDraw(dt);
    if (dust.out && !alive) { dust.on = false; dust.ctx.clearRect(0, 0, dust.w, dust.h); return; }
    dust.raf = requestAnimationFrame(dustFrame);
  }
  function dustScatter(x, y) {
    dust.out = true;
    for (var i = 0; i < dust.parts.length; i++) {
      var p = dust.parts[i], dx = p.x - x, dy = p.y - y, d = Math.sqrt(dx * dx + dy * dy) || 1, v = 2.2 + Math.random() * 3.2;
      p.vx = dx / d * v; p.vy = dy / d * v * 0.7;
    }
    if (reduce) { dust.ctx && dust.ctx.clearRect(0, 0, dust.w, dust.h); dust.on = false; return; }
    if (!dust.on) { dust.on = true; dust.last = 0; dust.raf = requestAnimationFrame(dustFrame); }
  }
  var codeShown = false;
  function showCode(ev) {
    if (!card || !card.code || codeShown) return;
    var box = $('codeBox'), r = box.getBoundingClientRect();
    var x = ev && ev.clientX ? ev.clientX - r.left : r.width / 2, y = ev && ev.clientY ? ev.clientY - r.top : r.height / 2;
    $('codeValue').textContent = card.code;   // the code is put on the page only now
    codeShown = true;
    $('code').classList.add('shown');
    box.setAttribute('aria-label', card.code);
    dustScatter(x, y);
    $('toggleCode').innerHTML = I.eyeOff + '<span>' + esc(t().hide) + '</span>';
  }
  function hideCode() {
    if (!codeShown) return;
    codeShown = false;
    $('code').classList.remove('shown');
    $('codeBox').setAttribute('aria-label', t().reveal);
    setTimeout(function () { if (!codeShown) $('codeValue').textContent = ''; }, 520);
    $('toggleCode').innerHTML = I.eye + '<span>' + esc(t().reveal) + '</span>';
    dustStart();
  }

  /* ---------- the page ---------- */
  function setTexts() {
    var w = t();
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-t]').forEach(function (el) { var v = w[el.getAttribute('data-t')]; if (typeof v === 'string') el.textContent = v; });
    $('preview').alt = w.picture;
    document.querySelectorAll('.langs [data-lang]').forEach(function (a) { a.setAttribute('aria-current', a.getAttribute('data-lang') === lang ? 'true' : 'false'); });
  }

  function renderCard() {
    var w = t(), c = card;
    design = DESIGNS.indexOf(c.design) >= 0 ? c.design : 'any';
    document.body.setAttribute('data-design', design);
    // the envelope
    var to = (c.to_name || '').trim(), from = (c.from_name || '').trim();
    var tt = to ? w.titleName : w.title;
    $('titleA').textContent = fill(tt[0], to);
    $('titleB').textContent = tt[1];
    $('from').hidden = !from;
    $('from').textContent = fill(w.from, from);
    $('seal').setAttribute('aria-label', w.seal);
    // the card
    $('art').innerHTML = ART[design];
    $('to').hidden = !to;
    $('to').textContent = to + ',';
    $('greet').textContent = to ? w.greetAfter[design] : w.greet[design];
    var wish = (c.message || '').trim() || w.wish[design];
    var wishEl = $('wish');
    wishEl.className = 'wish' + (wish.length > 120 ? ' long' : '');
    wishEl.innerHTML = wish.split(/(\s+)/).map(function (part) {
      if (!part) return '';
      if (/^\s+$/.test(part)) return part.indexOf('\n') >= 0 ? '<br>' : ' ';
      return '<span class="w">' + esc(part) + '</span>';
    }).join('');
    $('sign').hidden = !from;
    $('sign').textContent = '— ' + from;
    $('amount').textContent = money(c.amount);
    var unused = c.status === 'paid' && !!c.code;
    $('code').hidden = !unused;
    $('done').hidden = c.status !== 'redeemed';
    $('lockText').textContent = !c.confirm && c.phone_hint ? w.lockPhone.replace('{hint}', c.phone_hint) : w.lock;
    $('codeValue').textContent = codeShown ? c.code || '' : '';
    $('codeBox').setAttribute('aria-label', codeShown ? c.code : w.reveal);
    $('revealText').textContent = w.reveal;
    $('toggleCode').innerHTML = (codeShown ? I.eyeOff : I.eye) + '<span>' + esc(codeShown ? w.hide : w.reveal) + '</span>';
    $('copy').innerHTML = I.copy + '<span>' + esc(w.copy) + '</span>';
    // what to do next
    var act = $('activate');
    act.querySelector('span').textContent = unused ? w.activate : w.openApp;
    act.href = unused && !demo ? 'teri://gift/' + encodeURIComponent(token) : 'teri://gift-cards';
    $('shareBtn').querySelector('span').textContent = w.share;
    $('how').hidden = !unused;
    $('step1').textContent = PLAY_LIVE ? w.step1Play : ANDROID ? w.step1Android : w.step1;
    $('noAppText').textContent = w.noAppYet;
    $('step3').textContent = c.confirm ? (from ? fill(w.step3Name, from) : w.step3Anon) : w.step3Now;
    $('playLink').hidden = !PLAY_LIVE; $('playSoon').hidden = PLAY_LIVE;
    $('again').querySelector('span').textContent = w.again;
  }

  function show(next) {
    state = next;
    $('loading').hidden = next !== 'loading';
    $('problem').hidden = next !== 'problem';
    $('scene').hidden = !(next === 'closed' || next === 'open' || next === 'opening');
    $('closed').hidden = !(next === 'closed' || next === 'opening');
    $('open').hidden = !(next === 'open' || next === 'opening');
    if (next === 'problem') {
      $('problemText').textContent = t()[problem];
      $('retry').hidden = problem !== 'error';
    }
  }

  function render() {
    setTexts();
    if (card) renderCard();
    show(state);
    if (state === 'open') placePerf();
  }

  // the perforation's notches sit exactly on the dashed line
  function placePerf() {
    var cardEl = $('card'), perf = $('perf');
    if (!cardEl || !perf || cardEl.offsetParent === null) return;
    cardEl.style.setProperty('--py', (perf.offsetTop + 1) + 'px');
  }
  window.addEventListener('resize', placePerf);

  // the parts of the card arrive one after another
  function stagger(instant) {
    var list = ['art', 'to', 'greet'].map($);
    var words = $('wish').querySelectorAll('.w');
    var rest = ['sign', 'perf', 'certLabel', 'amount', 'codeLabel', 'codeBox', 'codeTools', 'lock', 'done', 'activate', 'shareBtn', 'storeRow', 'how', 'again'].map($);
    var all = [], d = 0;
    list.forEach(function (el) { if (el && !el.hidden) { all.push([el, d]); d += 70; } });
    var step = Math.max(14, Math.min(40, 900 / Math.max(1, words.length)));
    for (var i = 0; i < words.length; i++) { all.push([words[i], d]); d += step; }
    d += 60;
    rest.forEach(function (el) { if (el && !el.hidden) { all.push([el, d]); d += 55; } });
    all.forEach(function (x) {
      x[0].classList.add('in');
      x[0].classList.remove('on');
      x[0].style.setProperty('--d', (instant ? 0 : x[1]) + 'ms');
    });
    // one frame so the start is painted, then everything moves to its place
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      all.forEach(function (x) { x[0].classList.add('on'); });
    }); });
    setTimeout(function () {
      var a = $('amount'); a.classList.remove('shine'); void a.offsetWidth; a.classList.add('shine');
    }, instant ? 200 : Math.min(d, 1600));
    var gl = $('gloss'); gl.classList.remove('go');
    if (!instant) setTimeout(function () { void gl.offsetWidth; gl.classList.add('go'); }, 700);
    setTimeout(dustStart, instant ? 50 : 400);
  }

  function enterOpen(animated) {
    show('open');
    placePerf();
    if (!animated || reduce) { stagger(reduce); return; }
    anim($('cardWrap'), [{ opacity: 0, transform: 'translateY(26px) scale(.97)' }, { opacity: 1, transform: 'none' }], { duration: 720, easing: 'cubic-bezier(.23,1,.32,1)' });
    stagger(false);
  }

  var opening = false;
  function openGift() {
    if (state !== 'closed' || opening) return;
    opening = true;
    if (!demo) store('teri.gift.' + token, 'opened');
    haptic();
    if (reduce) {
      anim($('closed'), [{ opacity: 1 }, { opacity: 0 }], { duration: 280, easing: 'ease' }).then(function () {
        $('closed').style.opacity = ''; enterOpen(false); opening = false;
      });
      return;
    }
    state = 'opening';
    var seal = $('seal'), flap = $('flap'), envCard = $('envCard'), env = $('env');
    env.style.animationPlayState = 'paused';
    $('stage').classList.add('opening');
    // 1. the seal breaks
    var sr = seal.getBoundingClientRect(), er = $('stage').getBoundingClientRect();
    for (var i = 0; i < 9; i++) {
      var b = document.createElement('span'); b.className = 'bit';
      var a = (i / 9) * Math.PI * 2 + Math.random() * 0.5, dist = 36 + Math.random() * 40, sz = 0.5 + Math.random() * 0.8;
      b.style.left = (sr.left - er.left + sr.width / 2 - 4.5) + 'px'; b.style.top = (sr.top - er.top + sr.height / 2 - 4.5) + 'px';
      $('stage').appendChild(b);
      anim(b, [{ transform: 'translate(0,0) scale(' + sz + ')', opacity: 1 },
        { transform: 'translate(' + (Math.cos(a) * dist) + 'px,' + (Math.sin(a) * dist + 30) + 'px) scale(' + (sz * 0.6) + ')', opacity: 0 }],
        { duration: 700, easing: 'cubic-bezier(.23,1,.32,1)' }).then(function (el) { return function () { el.remove(); }; }(b));
    }
    anim(seal, [{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(1.14)', opacity: 1, offset: 0.25 }, { transform: 'scale(.35) rotate(25deg)', opacity: 0 }],
      { duration: 380, easing: 'cubic-bezier(.23,1,.32,1)' });
    anim($('flapShadow'), [{ opacity: 1 }, { opacity: 0 }], { duration: 260, delay: 140, easing: 'ease' });
    anim($('closedText'), [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-16px)' }], { duration: 420, delay: 120, easing: 'cubic-bezier(.23,1,.32,1)' });
    anim($('tap'), [{ opacity: 1 }, { opacity: 0 }], { duration: 200, easing: 'ease' });
    anim($('closedFoot'), [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(12px)' }], { duration: 360, delay: 60, easing: 'cubic-bezier(.23,1,.32,1)' });
    // 2. the flap opens towards her and folds back
    wait(170).then(function () {
      return anim(flap, [{ transform: 'rotateX(0deg)' }, { transform: 'rotateX(90deg)' }], { duration: 250, easing: 'cubic-bezier(.55,.06,.68,.19)' });
    }).then(function () {
      flap.style.zIndex = '1';
      flap.classList.add('flipped');
      return anim(flap, [{ transform: 'rotateX(90deg)' }, { transform: 'rotateX(180deg)' }], { duration: 320, easing: 'cubic-bezier(.22,.61,.36,1)' });
    }).then(function () {
      // 3. the card comes out, and the room fills with the occasion
      setTimeout(function () {
        var r = $('stage').getBoundingClientRect();
        burst(r.left + r.width / 2, r.top + r.height * 0.15);
      }, 260);
      return anim(envCard, [{ transform: 'translateY(0)' }, { transform: 'translateY(-64%)' }], { duration: 700, easing: 'cubic-bezier(.23,1,.32,1)' });
    }).then(function () {
      return wait(140);
    }).then(function () {
      // 4. the card grows from the envelope into the open card
      var from = envCard.getBoundingClientRect();
      show('opening');
      placePerf();
      var wrap = $('cardWrap'), to = wrap.getBoundingClientRect();
      var s = from.width / to.width, dx = from.left - to.left, dy = from.top - to.top;
      wrap.style.transformOrigin = '0 0';
      stagger(false);
      var inner = Array.prototype.slice.call(document.querySelectorAll('#card .in, #open .actions .in, #how, #again'));
      inner.forEach(function (el) { el.style.transitionDelay = 'calc(var(--d, 0ms) + 520ms)'; });
      anim($('stage'), [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(70px) scale(.94)' }], { duration: 620, easing: 'cubic-bezier(.77,0,.175,1)' });
      return anim(wrap, [
        { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + s + ')', opacity: 0 },
        { opacity: 1, offset: 0.18 },
        { transform: 'none', opacity: 1 }
      ], { duration: 860, easing: 'cubic-bezier(.77,0,.175,1)', fill: 'none' });
    }).then(function () {
      $('cardWrap').style.transformOrigin = '';
      show('open');
      resetEnvelope();
      opening = false;
      setTimeout(function () {
        document.querySelectorAll('#card .in, #open .actions .in, #how, #again').forEach(function (el) { el.style.transitionDelay = ''; });
      }, 2600);
    });
  }

  function resetEnvelope() {
    ['seal', 'flap', 'envCard', 'stage', 'closedText', 'closedFoot', 'flapShadow', 'tap'].forEach(function (id) {
      var el = $(id); if (!el) return;
      if (el.getAnimations) el.getAnimations().forEach(function (a) { a.cancel(); });
      el.style.zIndex = ''; el.style.opacity = '';
    });
    $('flap').classList.remove('flipped');
    $('env').style.animationPlayState = '';
    $('stage').classList.remove('opening');
  }

  function replay() {
    hideCode();
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    resetEnvelope();
    show('closed');
  }

  /* ---------- the picture for stories: the card without the code and the amount ---------- */
  function loadImg(src) {
    return new Promise(function (res, rej) { var im = new Image(); im.onload = function () { res(im); }; im.onerror = rej; im.src = src; });
  }
  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  function wrapLines(ctx, text, max) {
    var out = [];
    String(text).split('\n').forEach(function (para) {
      var words = para.split(/\s+/).filter(Boolean), line = '';
      words.forEach(function (wd) {
        var tryLine = line ? line + ' ' + wd : wd;
        if (ctx.measureText(tryLine).width <= max || !line) line = tryLine;
        else { out.push(line); line = wd; }
      });
      out.push(line);
    });
    return out;
  }
  function spaced(ctx, text, cx, y, track) {
    var chars = Array.from(text), widths = chars.map(function (ch) { return ctx.measureText(ch).width; });
    var total = widths.reduce(function (a, b) { return a + b; }, 0) + track * (chars.length - 1), x = cx - total / 2;
    ctx.textAlign = 'left';
    chars.forEach(function (ch, i) { ctx.fillText(ch, x, y); x += widths[i] + track; });
    ctx.textAlign = 'center';
  }
  function cssVar(name) { return getComputedStyle(document.body).getPropertyValue(name).trim(); }
  function seeded(seed) { var s = seed >>> 0; return function () { s += 0x6D2B79F5; var r = Math.imul(s ^ (s >>> 15), 1 | s); r ^= r + Math.imul(r ^ (r >>> 7), 61 | r); return ((r ^ (r >>> 14)) >>> 0) / 4294967296; }; }

  function drawStory(withWish) {
    var W = 1080, H = 1920, w = t(), c = card;
    var cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    var ctx = cv.getContext('2d');
    var fonts = [
      '600 96px "Cormorant Garamond"', 'italic 600 80px "Cormorant Garamond"', '700 40px "Cormorant Garamond"', '600 70px "Caveat"'
    ];
    var ready = document.fonts && document.fonts.load ? Promise.all(fonts.map(function (f) { return document.fonts.load(f, 'АӘҒҚҢӨҰҮҺІ аәғқңөұүһі'); })).catch(function () {}) : Promise.resolve();
    var art = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(ART[design].replace('<svg ', '<svg width="300" height="300" '));
    return ready.then(function () { return Promise.all([loadImg(art), loadImg(ICON).catch(function () { return null; })]); }).then(function (imgs) {
      var ink = cssVar('--ink'), muted = cssVar('--muted'), accent = cssVar('--accent'), paper = cssVar('--paper'), line = cssVar('--line');
      // the room
      var g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, cssVar('--bg-a')); g.addColorStop(1, cssVar('--bg-b'));
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      var glow = ctx.createRadialGradient(W / 2, -120, 40, W / 2, -120, 1300);
      glow.addColorStop(0, cssVar('--bg-glow')); glow.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.globalAlpha = 0.9; ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;
      // what goes on the card
      var to = (c.to_name || '').trim(), from = (c.from_name || '').trim();
      var cw = 860, cx = (W - cw) / 2, pad = 76, inner = cw - pad * 2;
      ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
      ctx.font = 'italic 600 80px "Cormorant Garamond"';
      var toLines = to ? wrapLines(ctx, to + ',', inner) : [];
      ctx.font = '600 96px "Cormorant Garamond"';
      var greetLines = wrapLines(ctx, to ? w.greetAfter[design] : w.greet[design], inner);
      var wishText = (c.message || '').trim() || w.wish[design], wishSize = 70, wishLines = [];
      if (withWish) {
        for (; wishSize >= 48; wishSize -= 4) {
          ctx.font = '600 ' + wishSize + 'px "Caveat"';
          wishLines = wrapLines(ctx, wishText, inner);
          if (wishLines.length <= 7) break;
        }
        if (wishLines.length > 8) { wishLines = wishLines.slice(0, 8); wishLines[7] = wishLines[7].replace(/\s*\S*$/, '') + '…'; }
      }
      var h = 70 + 300 + 24 + toLines.length * 86 + greetLines.length * 96 + (withWish ? 50 + wishLines.length * wishSize * 1.18 : 0) +
        (from ? 30 + 70 : 0) + 64 + 46 + 70;
      var top = Math.max(150, (H - h - 220) / 2), cy = top;
      // a few things in the air around the card
      var rnd = seeded(DESIGNS.indexOf(design) * 977 + 13), k = KINDS[design];
      for (var i = 0; i < 46; i++) {
        var px = rnd() * W, py = rnd() * H;
        if (px > cx - 30 && px < cx + cw + 30 && py > top - 30 && py < top + h + 30) continue;
        ctx.save(); ctx.globalAlpha = 0.55 + rnd() * 0.4; ctx.translate(px, py); ctx.rotate(rnd() * 6.28);
        drawShape(ctx, k.shapes[i % k.shapes.length], 7 + rnd() * 9, k.colors[i % k.colors.length]); ctx.restore();
      }
      // the card
      ctx.save(); ctx.shadowColor = 'rgba(' + cssVar('--shadow') + ',.28)'; ctx.shadowBlur = 80; ctx.shadowOffsetY = 36;
      rr(ctx, cx, top, cw, h, 56); ctx.fillStyle = paper; ctx.fill(); ctx.restore();
      var tint = ctx.createRadialGradient(W / 2, top, 10, W / 2, top, 520);
      tint.addColorStop(0, accent + '22'); tint.addColorStop(1, accent + '00');
      ctx.save(); rr(ctx, cx, top, cw, h, 56); ctx.clip(); ctx.fillStyle = tint; ctx.fillRect(cx, top, cw, 520); ctx.restore();
      cy = top + 70;
      ctx.drawImage(imgs[0], W / 2 - 150, cy, 300, 300); cy += 300 + 24;
      ctx.fillStyle = ink; ctx.font = 'italic 600 80px "Cormorant Garamond"';
      toLines.forEach(function (l) { cy += 76; ctx.fillText(l, W / 2, cy); cy += 10; });
      ctx.fillStyle = accent; ctx.font = '600 96px "Cormorant Garamond"';
      greetLines.forEach(function (l) { cy += 88; ctx.fillText(l, W / 2, cy); cy += 8; });
      if (withWish) {
        cy += 50; ctx.fillStyle = ink; ctx.font = '600 ' + wishSize + 'px "Caveat"';
        wishLines.forEach(function (l) { cy += wishSize * 1.02; ctx.fillText(l, W / 2, cy); cy += wishSize * 0.16; });
      }
      if (from) {
        cy += 30 + 60; ctx.fillStyle = muted; ctx.font = '600 64px "Caveat"'; ctx.textAlign = 'right';
        ctx.fillText('— ' + from, cx + cw - pad, cy); ctx.textAlign = 'center'; cy += 10;
      }
      cy += 50;
      ctx.strokeStyle = line; ctx.lineWidth = 3; ctx.setLineDash([12, 10]);
      ctx.beginPath(); ctx.moveTo(cx + 40, cy); ctx.lineTo(cx + cw - 40, cy); ctx.stroke(); ctx.setLineDash([]);
      cy += 64; ctx.fillStyle = muted; ctx.font = '600 30px ' + getComputedStyle(document.body).fontFamily;
      spaced(ctx, w.storyGift.toUpperCase(), W / 2, cy, 5);
      // Teri under the card
      var by = top + h + 120;
      ctx.font = '700 54px ' + getComputedStyle(document.body).fontFamily; ctx.fillStyle = cssVar('--on-bg');
      var label = 'Teri', lw = ctx.measureText(label).width, iw = imgs[1] ? 76 : 0, gap = imgs[1] ? 22 : 0, bx = W / 2 - (iw + gap + lw) / 2;
      if (imgs[1]) { ctx.save(); rr(ctx, bx, by - 58, 76, 76, 20); ctx.clip(); ctx.drawImage(imgs[1], bx, by - 58, 76, 76); ctx.restore(); }
      ctx.textAlign = 'left'; ctx.fillText(label, bx + iw + gap, by); ctx.textAlign = 'center';
      ctx.font = '500 34px ' + getComputedStyle(document.body).fontFamily; ctx.fillStyle = cssVar('--on-bg-muted');
      ctx.fillText(w.storyTag, W / 2, by + 62);
      return new Promise(function (res) { cv.toBlob(function (b) { res(b); }, 'image/png'); });
    });
  }

  var story = { blob: null, url: null, busy: null };
  function makeStory() {
    var withWish = $('withWish').checked;
    $('preview').removeAttribute('src');
    story.blob = null;
    $('shareNow').disabled = true; $('save').setAttribute('aria-disabled', 'true');
    var job = drawStory(withWish).then(function (b) {
      if (story.busy !== job) return;
      story.blob = b;
      if (story.url) URL.revokeObjectURL(story.url);
      story.url = URL.createObjectURL(b);
      $('preview').src = story.url;
      $('save').href = story.url;
      $('shareNow').disabled = false; $('save').removeAttribute('aria-disabled');
    }).catch(function () {});
    story.busy = job;
    return job;
  }
  function openSheet() {
    var sh = $('sheet');
    hideCode();
    sh.hidden = false;
    requestAnimationFrame(function () { requestAnimationFrame(function () { sh.classList.add('on'); }); });
    var file = new File([new Blob([''], { type: 'image/png' })], 'x.png', { type: 'image/png' });
    var canFiles = !!(navigator.canShare && navigator.share && (function () { try { return navigator.canShare({ files: [file] }); } catch (e) { return false; } })());
    $('shareNow').hidden = !canFiles;
    $('holdHint').hidden = canFiles;
    makeStory();
    setTimeout(function () { $('sheetClose').focus(); }, 60);
  }
  function closeSheet() {
    var sh = $('sheet');
    sh.classList.remove('on');
    setTimeout(function () { sh.hidden = true; }, reduce ? 0 : 420);
    $('shareBtn').focus();
  }
  function shareStory() {
    if (!story.blob) return;
    var w = t();
    var file = new File([story.blob], 'teri-gift.png', { type: 'image/png' });
    navigator.share({ files: [file], text: w.shareText + ' ' + GO }).catch(function () {});
  }

  /* ---------- loading ---------- */
  function fontsReady() {
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    var need = ['600 44px "Cormorant Garamond"', 'italic 600 44px "Cormorant Garamond"', '600 28px "Caveat"'];
    return Promise.race([Promise.all(need.map(function (f) { return document.fonts.load(f, 'Аа Әә Ққ Ңң Өө Ұұ Үү Іі ₸'); })), wait(1500)]).catch(function () {});
  }

  function begin(c) {
    card = c;
    var saved = store('teri.lang');
    if (saved !== 'ru' && saved !== 'kk') lang = c.lang === 'kk' ? 'kk' : 'ru';
    if (c.status === 'cancelled') { problem = 'cancelled'; state = 'problem'; render(); return; }
    var opened = c.status === 'redeemed' || (!demo && store('teri.gift.' + token) === 'opened');
    state = opened ? 'open' : 'closed';
    render();
    buildEnvelope();
    ambientStart();
    if (opened) enterOpen(true);
  }

  function load() {
    state = 'loading'; problem = null; render();
    if (demo) {
      var s = q.get('s');
      begin({ status: s === 'redeemed' ? 'redeemed' : 'paid', amount: 20000, design: demo,
        to_name: q.get('to') === '' ? '' : 'Айгерим', from_name: q.get('from') === '' ? '' : 'Бота', message: q.get('m') || null,
        lang: lang, code: 'K7QM-4TZX-9HWP', phone_hint: null, confirm: true });
      token = 'demo';
      return;
    }
    if (!/^[a-z0-9]{16,40}$/.test(token)) { problem = 'notFound'; state = 'problem'; render(); return; }
    Promise.all([
      fetch(SUPABASE_URL + '/rest/v1/rpc/gift_card_view', {
        method: 'POST',
        headers: { apikey: SUPABASE_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ p_token: token })
      }).then(function (r) { if (!r.ok) throw new Error(String(r.status)); return r.json(); }),
      fontsReady()
    ]).then(function (res) {
      var c = res[0];
      if (!c || !c.status) { problem = 'notFound'; state = 'problem'; render(); return; }
      begin(c);
    }).catch(function () { problem = 'error'; state = 'problem'; render(); });
  }

  /* ---------- wiring ---------- */
  // the link-preview pictures are drawn from the same envelope and drawings (_build/og.html)
  if (document.body.hasAttribute('data-og')) {
    window.TeriGift = { ART: ART, KINDS: KINDS, sealSvg: sealSvg, pocketSvg: pocketSvg, flapSvg: flapSvg, drawShape: drawShape, seeded: seeded };
    return;
  }
  $('seal').addEventListener('click', openGift);
  $('openBtn').addEventListener('click', openGift);
  $('envCard').addEventListener('click', openGift);
  $('retry').addEventListener('click', load);
  $('again').addEventListener('click', replay);
  $('codeBox').addEventListener('click', function (e) { if (codeShown) return; showCode(e); });
  $('toggleCode').addEventListener('click', function (e) { if (codeShown) hideCode(); else showCode(null); });
  $('copy').addEventListener('click', function () {
    var b = this, code = card && card.code;
    if (!code) return;
    var done = function () {
      b.innerHTML = I.check + '<span>' + esc(t().copied) + '</span>';
      setTimeout(function () { b.innerHTML = I.copy + '<span>' + esc(t().copy) + '</span>'; }, 2000);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(code).then(done, function () { showCode(null); });
    else showCode(null);
  });
  $('activate').addEventListener('click', function () {
    var started = Date.now();
    setTimeout(function () {
      if (!document.hidden && Date.now() - started < 5000 && state === 'open') {
        $('noApp').hidden = false;
        anim($('noApp'), [{ opacity: 0, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'none' }], { duration: 360, easing: 'cubic-bezier(.23,1,.32,1)' });
      }
    }, 1600);
  });
  $('shareBtn').addEventListener('click', openSheet);
  $('sheetClose').addEventListener('click', closeSheet);
  $('sheetBg').addEventListener('click', closeSheet);
  $('withWish').addEventListener('change', makeStory);
  $('shareNow').addEventListener('click', shareStory);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !$('sheet').hidden) closeSheet(); });
  document.querySelectorAll('.langs [data-lang]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      if (state === 'opening') return;
      lang = a.getAttribute('data-lang'); store('teri.lang', lang); render();
      if (state === 'open') { placePerf(); }
    });
  });

  // icons into the static buttons
  $('tapIcon').innerHTML = I.up;
  $('preview').alt = '';
  $('shareBtn').insertAdjacentHTML('afterbegin', I.share);
  $('lockIcon').innerHTML = I.lock;
  $('doneIcon').innerHTML = I.check;
  $('revealIcon').innerHTML = I.eye;
  $('again').insertAdjacentHTML('afterbegin', I.again);
  $('subIcon').innerHTML = I.lock;
  $('save').insertAdjacentHTML('afterbegin', I.down);
  $('shareNow').insertAdjacentHTML('afterbegin', I.share);
  $('appstore').href = APPSTORE; $('playLink').href = PLAY; $('noAppStore').href = PLAY_LIVE && ANDROID ? PLAY : APPSTORE;

  var saved = store('teri.lang'), askLang = (q.get('l') || '').toLowerCase(), pageLang = document.body.getAttribute('data-page-lang');
  lang = demo && (askLang === 'kk' || askLang === 'ru') ? askLang
    : saved === 'kk' || saved === 'ru' ? saved
    : pageLang === 'kk' || pageLang === 'ru' ? pageLang
    : /^kk/i.test(navigator.language || '') ? 'kk' : 'ru';
  document.body.setAttribute('data-design', demo || design);
  if (demo) design = demo;
  load();
})();
