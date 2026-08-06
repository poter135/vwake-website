import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const locales = [
  {
    file: 'index.html',
    meta: 'Vwake 是為 VTuber 打造的語音鬧鐘平台，讓你的聲音融入粉絲每天的起點，透過無縫購買與鬧鐘體驗，延伸作品價值與長期連結。',
    social: '讓你的聲音成為粉絲每天醒來的第一刻。Vwake 將 VTuber 語音作品與鬧鐘體驗整合，延伸創作價值與粉絲連結。',
    label: '— 03 / 長期價值 / LASTING VALUE —',
    title: '讓每一段聲音，持續陪伴粉絲。',
    quote: '作品不只被收藏，更成為粉絲每天回到你的理由。',
    description: 'Vwake 負責上架、銷售、金流與客服，讓你專注創作。每一組語音都能在粉絲的日常中持續被使用，並透過穩定分潤累積長期價值；早安信則讓你在想互動時，延伸更深的陪伴。',
    forbidden: ['一次錄音', '被動收入'],
  },
  {
    file: 'en/index.html',
    meta: "Vwake is a VTuber voice alarm platform that makes your voice part of your fans' daily ritual, pairing a seamless alarm experience with lasting creative value.",
    social: 'Become the first voice your fans hear each day. Vwake brings VTuber voice releases into a seamless alarm experience built for lasting connection.',
    label: '— 03 / LASTING VALUE —',
    title: 'Let every voice stay part of their day.',
    quote: 'Your work is more than collected—it becomes a ritual fans return to every morning.',
    description: 'Vwake handles listing, sales, payments, and customer support so you can stay focused on creating. Each voice release can keep serving fans in daily life while building long-term value through ongoing revenue share; Morning Letters add a deeper layer of connection whenever you choose.',
    forbidden: ['Record once', 'Passive Revenue'],
  },
  {
    file: 'ja/index.html',
    meta: 'Vwakeは、VTuberの声をファンの毎日の始まりに届ける音声目覚ましプラットフォーム。シームレスなアラーム体験を通じて、作品の価値とファンとの長期的なつながりを育てます。',
    social: 'あなたの声を、ファンが毎朝最初に聴く声へ。VwakeはVTuberの音声作品と目覚まし体験を一つにし、創作の価値と継続的なつながりを広げます。',
    label: '— 03 / LASTING VALUE —',
    title: '一つひとつの声を、ファンの日常へ。',
    quote: '作品はコレクションで終わらず、ファンが毎朝あなたに会う習慣になります。',
    description: '出品・販売・決済・カスタマーサポートはVwakeが担い、あなたは創作に集中できます。音声作品はファンの日常で使われ続け、継続的な収益シェアとともに長期的な価値を育てます。モーニングレターは、届けたいときにより深い交流を加えられます。',
    forbidden: ['一度収録して', '長く稼ぐ'],
  },
];

function requiredMatch(text, pattern, label) {
  const match = text.match(pattern);
  assert.ok(match, `${label} must exist`);
  return match[1];
}

function normalize(text) {
  return text.replace(/\s+/g, ' ').trim();
}

function thirdPillar(html) {
  return requiredMatch(
    html,
    /(<div class="pillar">\s*<div class="pillar-num">— 03[\s\S]*?<\/div>\s*<\/div>)/,
    'third Why Vwake pillar',
  );
}

for (const locale of locales) {
  test(`${locale.file} presents localized premium creator copy`, async () => {
    const html = await readFile(locale.file, 'utf8');
    const meta = requiredMatch(html, /<meta name="description" content="([^"]+)">/, 'meta description');
    const social = [
      requiredMatch(html, /<meta property="og:description" content="([^"]+)">/, 'Open Graph description'),
      requiredMatch(html, /<meta name="twitter:description" content="([^"]+)">/, 'Twitter description'),
    ];
    const jsonLd = JSON.parse(requiredMatch(html, /<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/, 'JSON-LD'));
    const application = jsonLd['@graph'].find((item) => item['@type'] === 'SoftwareApplication');
    const pillar = thirdPillar(html);
    const values = [
      requiredMatch(pillar, /<div class="pillar-num">\s*([^<]+)\s*<\/div>/, 'third pillar label'),
      requiredMatch(pillar, /<h3 class="pillar-title">\s*([^<]+)\s*<\/h3>/, 'third pillar title'),
      requiredMatch(pillar, /<p class="pillar-quote">\s*([^<]+)\s*<\/p>/, 'third pillar quote'),
      requiredMatch(pillar, /<p class="pillar-desc">\s*([^<]+)\s*<\/p>/, 'third pillar description'),
    ].map(normalize);

    assert.equal(meta, locale.meta);
    assert.deepEqual(social, [locale.social, locale.social]);
    assert.equal(application?.description, locale.meta);
    assert.deepEqual(values, [locale.label, locale.title, locale.quote, locale.description]);

    const changedSurfaces = [meta, ...social, application?.description, ...values].join(' ');
    for (const phrase of locale.forbidden) assert.ok(!changedSurfaces.includes(phrase));
  });
}
