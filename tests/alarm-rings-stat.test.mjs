import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const locales = [
  {
    file: 'index.html',
    primaryNumber: '5000+',
    primaryLabel: '鬧鐘已響起',
    support: 'Vwake 的聲音，已經叫醒粉絲超過五千次。',
    secondaryLabel: 'VTuber 已上架',
  },
  {
    file: 'en/index.html',
    primaryNumber: '5,000+',
    primaryLabel: 'alarm wake-ups',
    support: 'Vwake voices have already woken fans more than five thousand times.',
    secondaryLabel: 'VTubers live',
  },
  {
    file: 'ja/index.html',
    primaryNumber: '5,000+',
    primaryLabel: 'アラームが鳴った回数',
    support: 'Vwakeの声は、すでに5,000回以上ファンを目覚めさせています。',
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
  test(`${locale.file} presents alarm rings as the only primary metric`, async () => {
    const html = await readFile(locale.file, 'utf8');
    const roster = rosterFragment(html);

    assert.match(roster, /class="rstat rstat-primary"/);
    assert.ok(roster.includes(locale.primaryNumber));
    assert.ok(roster.includes(locale.primaryLabel));
    assert.ok(roster.includes(locale.support));
    assert.match(roster, /class="rstat rstat-secondary"/);
    assert.ok(roster.includes('30+'));
    assert.ok(roster.includes(locale.secondaryLabel));
    assert.equal((roster.match(/class="rstat(?:\s|\")/g) ?? []).length, 2);
    assert.ok(!roster.includes('100+'));
    assert.ok(!roster.includes('1500+'));
  });

  test(`${locale.file} defines a responsive visual hierarchy`, async () => {
    const html = await readFile(locale.file, 'utf8');

    assert.match(html, /\.rstat-primary\s*\{/);
    assert.match(html, /\.rstat-support\s*\{/);
    assert.match(html, /\.rstat-secondary\s*\{/);
    assert.match(
      html,
      /@media \(max-width: 540px\)[\s\S]*?\.roster-stats\s*\{[^}]*flex-direction:\s*column;/,
    );
    assert.match(
      html,
      /@media \(max-width: 540px\)[\s\S]*?\.rstat-primary::before\s*\{[^}]*inset:\s*-10px 0;/,
    );
  });
}
