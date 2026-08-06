import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const pages = [
  {
    file: 'index.html',
    title: 'Vwake｜VTuber 語音鬧鐘平台 — 讓你的聲音，成為粉絲每天的第一刻',
    oldPhrase: '一次錄音',
  },
  {
    file: 'en/index.html',
    title: 'Vwake | VTuber Voice Alarm Platform — Be the First Voice Your Fans Hear Each Day',
    oldPhrase: 'Record once',
  },
  {
    file: 'ja/index.html',
    title: 'Vwake｜VTuber音声目覚ましプラットフォーム — あなたの声を、ファンの一日の始まりに',
    oldPhrase: '一度収録して',
  },
];

function requiredMatch(html, pattern, label) {
  const match = html.match(pattern);
  assert.ok(match, `${label} must exist`);
  return match[1];
}

for (const page of pages) {
  test(`${page.file} uses premium creator positioning in all title metadata`, async () => {
    const html = await readFile(page.file, 'utf8');
    const values = [
      requiredMatch(html, /<title>([^<]+)<\/title>/, 'document title'),
      requiredMatch(html, /<meta property="og:title" content="([^"]+)">/, 'Open Graph title'),
      requiredMatch(html, /<meta name="twitter:title" content="([^"]+)">/, 'Twitter title'),
    ];

    assert.deepEqual(values, [page.title, page.title, page.title]);
    for (const value of values) assert.ok(!value.includes(page.oldPhrase));
  });
}
