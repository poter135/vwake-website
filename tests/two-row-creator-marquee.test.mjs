import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pages = ['index.html', 'en/index.html', 'ja/index.html'];
const expectedCreators = [
  ['shiori', '小原栞', 'SHIORI'],
  ['allieanka', '艾莉安卡', 'ALLIEANKA'],
  ['zhaxia520', '炸蝦君', 'ZHAXIA520'],
  ['yukiha', '雪羽 Yuki', 'YUKIHA'],
  ['xunbaomao', '尋寶喵', 'XUNBAOMAO'],
  ['aone_nao', '蒼音夏緒', 'AONE NAO'],
  ['sabina', '人偶．薩賓娜／薩琪', 'SABINA'],
  ['yabi', '牙白不牙白', 'YABI'],
  ['ucrhlzl1kx0bzsiehkrfakrg', '芽瑪', 'YAMA'],
  ['quindaizier', '奎因黛希爾', 'QUINDAIZIER'],
  ['ribi', '莉比 Ribi', 'RIBI'],
  ['pyonchan', 'ぴょんちゃん兔兔', 'PYONCHAN'],
  ['skymeowu', '仙喵 SkyMeowu', 'SKYMEOWU'],
  ['chimera', '奇美拉圈圈', 'CHIMERA'],
  ['luby_abby', '露比艾比 Luby Abby', 'LUBY ABBY'],
  ['maple', '阿楓轟炸', 'MAPLE'],
  ['aquariusgirl', '水瓶罐子', 'AQUARIUS'],
  ['fingla', '芬格拉 Fingla', 'FINGLA'],
  ['xueying', '雪迎', 'XUEYING'],
  ['maruru', '瑪露露 Maruru', 'MARURU'],
  ['koiyuki', '白熊 恋雪', 'KOIYUKI'],
  ['miyuki_aimu', '深雪あいむ', 'MIYUKI AIMU'],
  ['kinkinko', '金金子', 'KINKINKO'],
  ['snowfox', '雪下靈狐', 'SNOWFOX'],
  ['delvi', '黛菲 Delvi', 'DELVI'],
  ['yufang', '月下香幽芳 YuFang', 'YUFANG'],
  ['aya', '赤羽亞矢 AYA', 'AYA'],
  ['shiki', '嘻希呦', 'SHIKI'],
  ['tsugumi', '黛鶇', 'TSUGUMI'],
  ['elina', '宮森えりな', 'ELINA'],
  ['yukichan', '小雪 Yukichan', 'YUKICHAN'],
  ['aki', 'Aki 安希', 'AKI'],
  ['hanasaki', '魔法少女花咲', 'HANASAKI'],
  ['somaru', '水縹そまる', 'SOMARU'],
].map(([id, name, label]) => ({
  id,
  name,
  label,
  avatar: `/assets/creators/marquee/${id}.webp`,
}));

function between(source, startMarker, endMarker, label) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start + startMarker.length);
  assert.notEqual(start, -1, `${label} start marker must exist`);
  assert.notEqual(end, -1, `${label} end marker must exist`);
  return source.slice(start + startMarker.length, end);
}

function cards(fragment) {
  return [...fragment.matchAll(/<article class="creator-marquee-card" data-creator-id="([^"]+)">([\s\S]*?)<\/article>/g)]
    .map((match) => {
      const body = match[2];
      const image = body.match(/<img src="([^"]+)" alt="([^"]*)" width="160" height="160" loading="lazy" decoding="async">/);
      const name = body.match(/<div class="creator-marquee-card-name">([^<]+)<\/div>/);
      const label = body.match(/<div class="creator-marquee-card-label">([^<]+)<\/div>/);
      assert.ok(image, `${match[1]} must have a fully specified mapped image`);
      assert.ok(name, `${match[1]} must have a display name`);
      assert.ok(label, `${match[1]} must have a short label`);
      return { id: match[1], name: name[1], label: label[1], avatar: image[1], alt: image[2] };
    });
}

function pageSnapshot(page) {
  const html = readFileSync(join(root, page), 'utf8');
  const marquee = between(html, '<!-- CREATOR_MARQUEE_START -->', '<!-- CREATOR_MARQUEE_END -->', `${page} marquee`);
  const top = cards(between(marquee, '<!-- CREATOR_TOP_START -->', '<!-- CREATOR_TOP_END -->', `${page} top lane`));
  const bottom = cards(between(marquee, '<!-- CREATOR_BOTTOM_START -->', '<!-- CREATOR_BOTTOM_END -->', `${page} bottom lane`));
  const topDuplicate = cards(between(marquee, '<!-- CREATOR_TOP_DUPLICATE_START -->', '<!-- CREATOR_TOP_DUPLICATE_END -->', `${page} top duplicate`));
  const bottomDuplicate = cards(between(marquee, '<!-- CREATOR_BOTTOM_DUPLICATE_START -->', '<!-- CREATOR_BOTTOM_DUPLICATE_END -->', `${page} bottom duplicate`));
  return { html, marquee, top, bottom, topDuplicate, bottomDuplicate };
}

function webpDimensions(buffer) {
  assert.equal(buffer.toString('ascii', 0, 4), 'RIFF');
  assert.equal(buffer.toString('ascii', 8, 12), 'WEBP');
  for (let offset = 12; offset + 8 <= buffer.length;) {
    const type = buffer.toString('ascii', offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    const data = offset + 8;
    if (type === 'VP8X') return [1 + buffer.readUIntLE(data + 4, 3), 1 + buffer.readUIntLE(data + 7, 3)];
    if (type === 'VP8 ') return [buffer.readUInt16LE(data + 6) & 0x3fff, buffer.readUInt16LE(data + 8) & 0x3fff];
    if (type === 'VP8L') {
      const bits = buffer.readUInt32LE(data + 1);
      return [1 + (bits & 0x3fff), 1 + ((bits >>> 14) & 0x3fff)];
    }
    offset = data + size + (size % 2);
  }
  assert.fail('WebP dimensions must be readable');
}

test('all locales map the same 34 names to the correct creator IDs and avatars', () => {
  const snapshots = pages.map(pageSnapshot);
  for (const [index, snapshot] of snapshots.entries()) {
    assert.equal(snapshot.top.length, 17, `${pages[index]} top lane must have 17 creators`);
    assert.equal(snapshot.bottom.length, 17, `${pages[index]} bottom lane must have 17 creators`);
    const accessible = [...snapshot.top, ...snapshot.bottom].map(({ alt, ...creator }) => creator);
    assert.deepEqual(accessible, expectedCreators, `${pages[index]} creator mapping changed`);
    [...snapshot.top, ...snapshot.bottom].forEach((creator) => assert.equal(creator.alt, creator.name));
    assert.deepEqual(snapshot.topDuplicate.map(({ alt, ...creator }) => creator), expectedCreators.slice(0, 17));
    assert.deepEqual(snapshot.bottomDuplicate.map(({ alt, ...creator }) => creator), expectedCreators.slice(17));
    [...snapshot.topDuplicate, ...snapshot.bottomDuplicate].forEach((creator) => assert.equal(creator.alt, ''));
    assert.equal((snapshot.marquee.match(/class="creator-marquee-sequence" aria-hidden="true"/g) ?? []).length, 2);
    assert.doesNotMatch(snapshot.marquee, /aria-hidden="true"[^>]*tabindex|tabindex[^>]*aria-hidden="true"/);
    assert.doesNotMatch(snapshot.html, /class="roster-marquee"/);
    assert.match(snapshot.html, /href="\/assets\/creator-marquee\.css"/);
  }
});

test('all 34 runtime thumbnails are square WebPs within the transfer budget', () => {
  let totalBytes = 0;
  for (const creator of expectedCreators) {
    const path = join(root, creator.avatar.slice(1));
    assert.ok(existsSync(path), `${creator.id} mapped avatar must exist`);
    const size = statSync(path).size;
    totalBytes += size;
    assert.ok(size <= 80 * 1024, `${creator.id} must be at most 80 KiB`);
    assert.deepEqual(webpDimensions(readFileSync(path)), [160, 160], `${creator.id} must be 160 × 160`);
  }
  assert.ok(totalBytes <= 2 * 1024 * 1024, `thumbnail set is ${(totalBytes / 1048576).toFixed(2)} MiB`);
});

test('shared CSS keeps both lanes equal, opposite, pausable, and overflow-safe', () => {
  const path = join(root, 'assets/creator-marquee.css');
  assert.ok(existsSync(path), 'shared marquee stylesheet must exist');
  const css = readFileSync(path, 'utf8');
  assert.match(css, /--marquee-card-width:\s*178px/);
  assert.match(css, /--marquee-gap:\s*10px/);
  assert.match(css, /animation-duration:\s*72\.6s/);
  assert.match(css, /creator-marquee-lane--left[\s\S]*animation-name:\s*marquee-left/);
  assert.match(css, /creator-marquee-lane--right[\s\S]*animation-name:\s*marquee-right/);
  assert.match(css, /\.creator-marquee:hover[\s\S]*animation-play-state:\s*paused/);
  assert.match(css, /\.creator-marquee:focus-within[\s\S]*animation-play-state:\s*paused/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /\.creator-marquee-sequence\[aria-hidden="true"\][\s\S]*display:\s*none/);
  assert.match(css, /min-width:\s*0/);
  assert.match(css, /-webkit-line-clamp:\s*2/);
});
