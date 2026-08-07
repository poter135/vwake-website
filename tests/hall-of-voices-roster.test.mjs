import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import test from 'node:test';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pages = ['index.html', 'en/index.html', 'ja/index.html'];
const expectedIds = [
  'shiori', 'allieanka', 'zhaxia520', 'yukiha', 'xunbaomao', 'aone_nao',
  'sabina', 'yabi', 'ucrhlzl1kx0bzsiehkrfakrg', 'quindaizier', 'ribi',
  'pyonchan', 'skymeowu', 'chimera', 'luby_abby', 'maple', 'aquariusgirl',
  'fingla', 'xueying', 'maruru', 'koiyuki', 'miyuki_aimu', 'kinkinko',
  'snowfox', 'delvi', 'yufang', 'aya', 'shiki', 'tsugumi', 'elina',
  'yukichan', 'aki', 'hanasaki', 'somaru',
];

function hallMarkup(page) {
  const html = readFileSync(join(root, page), 'utf8');
  const start = html.indexOf('<div class="hall-of-voices"');
  assert.notEqual(start, -1, `${page} must render Hall of Voices`);
  const end = html.indexOf('</section>', start);
  assert.notEqual(end, -1, `${page} Hall must remain inside its roster section`);
  return { html, hall: html.slice(start, end) };
}

function rosterSnapshot(hall) {
  return [...hall.matchAll(
    /<article class="hall-card" data-creator-id="([^"]+)"[\s\S]*?<img[^>]+src="([^"]+)"[^>]+alt="([^"]*)"[^>]*>[\s\S]*?<div class="hall-card-name">([^<]+)<\/div>[\s\S]*?<div class="hall-card-meta">([^<]+)<\/div>/g,
  )].map((match) => ({
    id: match[1], avatar: match[2], alt: match[3], name: match[4], meta: match[5],
  }));
}

test('all localized pages expose the same complete accessible 34-person roster', () => {
  const snapshots = pages.map((page) => {
    const { html, hall } = hallMarkup(page);
    assert.match(hall, /data-spotlight-offsets="0,11,23"/);
    assert.doesNotMatch(html, /roster-marquee|roster-track|@keyframes roster-scroll/);
    assert.doesNotMatch(hall, /aria-hidden="true"/);

    const roster = rosterSnapshot(hall);
    assert.deepEqual(roster.map(({ id }) => id), expectedIds, `${page} roster order changed`);
    assert.equal(new Set(roster.map(({ id }) => id)).size, 34, `${page} has duplicate creators`);
    for (const creator of roster) {
      assert.equal(creator.alt, creator.name, `${page} avatar alt must identify ${creator.id}`);
      assert.match(creator.avatar, /^\/assets\/creators\/avatars\/[a-z0-9_]+\.(?:png|jpg)$/);
      assert.ok(existsSync(join(root, creator.avatar.slice(1))), `${creator.avatar} must exist locally`);
    }
    return roster;
  });

  assert.deepEqual(snapshots[1], snapshots[0]);
  assert.deepEqual(snapshots[2], snapshots[0]);
});

test('daily spotlight offsets give every creator every slot exactly once per cycle', async () => {
  const modulePath = join(root, 'assets/hall-of-voices.mjs');
  assert.ok(existsSync(modulePath), 'Hall module must exist');
  const { spotlightIndexes } = await import(pathToFileURL(modulePath));
  const appearances = [new Set(), new Set(), new Set()];

  for (let day = 0; day < 34; day += 1) {
    const indexes = spotlightIndexes(day, 34, [0, 11, 23]);
    assert.equal(new Set(indexes).size, 3, `day ${day} must show three distinct creators`);
    indexes.forEach((index, slot) => appearances[slot].add(expectedIds[index]));
  }

  appearances.forEach((creators) => assert.equal(creators.size, 34));
});

test('roster rotation is stable and does not mutate its input', async () => {
  const modulePath = join(root, 'assets/hall-of-voices.mjs');
  assert.ok(existsSync(modulePath), 'Hall module must exist');
  const { rotateRoster } = await import(pathToFileURL(modulePath));
  const input = [...expectedIds];
  const rotated = rotateRoster(input, 1);

  assert.deepEqual(rotated, [...expectedIds.slice(1), expectedIds[0]]);
  assert.deepEqual(input, expectedIds);
});
