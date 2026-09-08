import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const locales = [
  {
    file: 'index.html',
    meta: 'Vwake 是為 VTuber 打造的語音鬧鐘平台，讓你的聲音融入粉絲每天的起點，透過無縫購買與鬧鐘體驗，延伸作品價值與長期連結。',
    social: '讓你的聲音成為粉絲每天醒來的第一刻。Vwake 將 VTuber 語音作品與鬧鐘體驗整合，延伸創作價值與粉絲連結。',
    forbidden: ['一次錄音', '被動收入'],
  },
  {
    file: 'en/index.html',
    meta: "Vwake is a VTuber voice alarm platform that makes your voice part of your fans' daily ritual, pairing a seamless alarm experience with lasting creative value.",
    social: 'Become the first voice your fans hear each day. Vwake brings VTuber voice releases into a seamless alarm experience built for lasting connection.',
    forbidden: ['Record once', 'Passive Revenue'],
  },
  {
    file: 'ja/index.html',
    meta: 'Vwakeは、VTuberの声をファンの毎日の始まりに届ける音声目覚ましプラットフォーム。シームレスなアラーム体験を通じて、作品の価値とファンとの長期的なつながりを育てます。',
    social: 'あなたの声を、ファンが毎朝最初に聴く声へ。VwakeはVTuberの音声作品と目覚まし体験を一つにし、創作の価値と継続的なつながりを広げます。',
    forbidden: ['一度収録して', '長く稼ぐ'],
  },
];

function requiredMatch(text, pattern, label) {
  const match = text.match(pattern);
  assert.ok(match, `${label} must exist`);
  return match[1];
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
    assert.equal(meta, locale.meta);
    assert.deepEqual(social, [locale.social, locale.social]);
    assert.equal(application?.description, locale.meta);

    const changedSurfaces = [meta, ...social, application?.description].join(' ');
    for (const phrase of locale.forbidden) assert.ok(!changedSurfaces.includes(phrase));
  });
}
