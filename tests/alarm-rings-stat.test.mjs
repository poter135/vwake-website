import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const locales = [
  {
    file: 'index.html',
    primaryNumber: '5000+',
    primaryLabel: '鬧鐘語音響起',
    secondaryLabel: 'VTuber 已上架',
  },
  {
    file: 'en/index.html',
    primaryNumber: '5,000+',
    primaryLabel: 'alarm wake-ups',
    secondaryLabel: 'VTubers live',
  },
  {
    file: 'ja/index.html',
    primaryNumber: '5,000+',
    primaryLabel: 'アラームが鳴った回数',
    secondaryLabel: 'VTuber 出品中',
  },
];

function rosterFragment(html) {
  const start = html.indexOf('<div class="roster-stats">');
  const end = html.indexOf('<div class="roster-marquee">', start);

  assert.notEqual(start, -1, 'roster stats must exist');
  assert.notEqual(end, -1, 'roster marquee must follow the stats');
  return html.slice(start, end);
}

for (const locale of locales) {
  test(`${locale.file} presents two concise roster metrics`, async () => {
    const html = await readFile(locale.file, 'utf8');
    const roster = rosterFragment(html);

    assert.equal((roster.match(/class="rstat"/g) ?? []).length, 2);
    assert.ok(roster.includes(locale.primaryNumber));
    assert.ok(roster.includes(locale.primaryLabel));
    assert.ok(roster.includes('30+'));
    assert.ok(roster.includes(locale.secondaryLabel));
    assert.ok(!roster.includes('rstat-primary'));
    assert.ok(!roster.includes('rstat-secondary'));
    assert.ok(!roster.includes('rstat-support'));
    assert.ok(!roster.includes('100+'));
    assert.ok(!roster.includes('1500+'));
  });

  test(`${locale.file} keeps the original roster-stat styling`, async () => {
    const html = await readFile(locale.file, 'utf8');

    assert.match(html, /\.roster-stats\s*\{[^}]*gap:\s*48px;[^}]*margin:\s*4px 0 22px;/);
    assert.match(html, /@media \(max-width: 540px\)\s*\{\s*\.roster-stats\s*\{\s*gap:\s*30px;\s*\}/);
    assert.ok(!html.includes('.rstat-primary'));
    assert.ok(!html.includes('.rstat-secondary'));
    assert.ok(!html.includes('.rstat-support'));
  });
}
