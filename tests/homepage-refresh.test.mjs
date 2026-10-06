import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const locales = [
  {
    file: 'index.html',
    tagline: '把 VTuber 的聲音帶入生活',
    heroDescription: 'Vwake 是專為 VTuber 打造的語音平台。粉絲可以用你的聲音設定鬧鐘，也能在日常中播放，讓熟悉的聲音陪伴每一天。',
    title: '讓你的聲音真正進入粉絲的生活',
    whyDescription: '遠高於其他周邊的使用頻率，讓你的聲音從一次性的商品，成為粉絲日常裡會反覆回來使用的陪伴。',
    oldDescription: '粉絲購買你的聲音後，仍會在第 30 天與第 60 天回來使用。',
    d30: '購買後第 24–30 天仍使用',
    d60: '購買後第 54–60 天仍使用',
    repeat: '買家購買超過一個語音包',
    lettersDescription: '使用早安信與粉絲建立一對一連結，讓每位粉絲都能收到只屬於自己的回覆，將一次聲音體驗延伸成持續互動。',
  },
  {
    file: 'en/index.html',
    tagline: "Bringing VTuber voices into fans’ daily lives.",
    heroDescription: 'Vwake is a voice platform built for VTubers. Fans can set your voice as their alarm or listen throughout the day, bringing a familiar voice into their everyday lives.',
    title: 'Bring your voice into your fans’ lives.',
    whyDescription: 'Used far more often than other merch, your voice becomes a familiar part of fans’ routines instead of a one-time purchase.',
    oldDescription: 'Fans keep coming back to use your voice weeks after they buy it.',
    d30: 'Still active 24–30 days after purchase',
    d60: 'Still active 54–60 days after purchase',
    repeat: 'buyers purchased more than one voice pack',
    lettersDescription: 'Build one-to-one connections with fans through Morning Letters, giving each person a personal reply and extending a voice experience into an ongoing conversation.',
  },
  {
    file: 'ja/index.html',
    tagline: 'VTuberの声をファンの日常へ。',
    heroDescription: 'VwakeはVTuberのためのボイスプラットフォームです。ファンはあなたの声をアラームに設定したり、日常の中で再生したりして、いつもの声と一緒に毎日を過ごせます。',
    title: 'あなたの声を、ファンの生活へ。',
    whyDescription: '他のグッズを大きく上回る利用頻度。あなたの声を一度きりの商品ではなく、ファンの日常に繰り返し届く存在へ。',
    oldDescription: 'ファンは購入後も、何週間もあなたの声を使い続けます。',
    d30: '購入後24〜30日目も利用',
    d60: '購入後54〜60日目も利用',
    repeat: '購入者が2つ以上のボイスパックを購入',
    lettersDescription: 'モーニングレターでファンと一対一のつながりを築き、一人ひとりに向けた返信で、声の体験を継続的な会話へと広げます。',
  },
];

function sectionFragment(html, id, nextId) {
  const start = html.indexOf(`<section class="section" id="${id}">`);
  const end = html.indexOf(`<section class="section" id="${nextId}">`, start);
  assert.notEqual(start, -1, `${id} section must exist`);
  assert.notEqual(end, -1, `${nextId} section must follow ${id}`);
  return html.slice(start, end);
}

function heroFragment(html) {
  const start = html.indexOf('<section class="hero">');
  const end = html.indexOf('</section>', start);
  assert.notEqual(start, -1, 'hero section must exist');
  assert.notEqual(end, -1, 'hero section must close');
  return html.slice(start, end);
}

function textContent(fragment) {
  return fragment.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

for (const locale of locales) {
  test(`${locale.file} uses the new localized hero message`, async () => {
    const html = await readFile(locale.file, 'utf8');
    const hero = heroFragment(html);

    assert.doesNotMatch(hero, /class="hero-eyebrow"/);
    assert.match(hero, /class="hero-desc"/);
    assert.match(textContent(hero), new RegExp(locale.tagline.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    assert.ok(textContent(hero).includes(locale.heroDescription));
    assert.equal((hero.match(/<br>/g) ?? []).length, 0);
  });

  test(`${locale.file} presents concise Why Vwake retention evidence`, async () => {
    const html = await readFile(locale.file, 'utf8');
    const why = sectionFragment(html, 'why', 'letters');

    assert.equal((why.match(/class="why-metric(?: why-metric-featured)?"/g) ?? []).length, 3);
    assert.ok(why.includes('34.2%'));
    assert.ok(why.includes('21.8%'));
    assert.ok(why.includes('25.6%'));
    assert.ok(why.includes(locale.d30));
    assert.ok(why.includes(locale.d60));
    assert.ok(why.includes(locale.repeat));
    assert.doesNotMatch(why, /why-metric-detail|52\/152|22\/101|40\/156/);
    assert.ok(why.includes(locale.title));
    assert.ok(why.includes(locale.whyDescription));
    assert.doesNotMatch(why, new RegExp(locale.oldDescription.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    assert.doesNotMatch(why, /pillars-grid|pillar-title|pillar-desc/);
  });

  test(`${locale.file} removes the Morning Letters card grid`, async () => {
    const html = await readFile(locale.file, 'utf8');
    const letters = sectionFragment(html, 'letters', 'roster');

    assert.doesNotMatch(letters, /class="ml-grid"|class="ml-card"|class="ml-desc"|class="ml-quote"/);
    assert.match(letters, /<p class="section-desc">/);
    assert.ok(letters.includes(locale.lettersDescription));
    assert.match(letters, /class="letters-banner"/);
  });
}
