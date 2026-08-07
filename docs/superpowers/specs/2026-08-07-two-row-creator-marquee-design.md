# Two-Row Creator Marquee Design

## Goal

Replace the current single-row 18-person creator marquee with a compact two-row marquee that presents all 34 active Vwake creators, preserves equal continuous exposure, and loads substantially faster than the reverted Hall of Voices implementation.

## Approved visual direction

Use the approved A1 refined layout:

- two horizontal lanes inside the existing roster section;
- the upper lane moves left and the lower lane moves right;
- each lane contains exactly 17 creators;
- compact horizontal cards pair a circular portrait with name and short romanized label;
- every card has the same fixed width, height, border, background, and avatar size;
- the text column uses `min-width: 0`, wraps the creator name to at most two lines, and clips only text that still exceeds that boundary;
- names never enlarge a card, overlap another card, or escape the card boundary;
- desktop shows approximately six or seven cards per lane, while mobile shows approximately two or three.

The surrounding section title and the existing `5000+` and `30+` metrics remain unchanged.

## Canonical creator data

Use one canonical roster with these 34 creator records in this order:

1. `shiori` — 小原栞 — `SHIORI`
2. `allieanka` — 艾莉安卡 — `ALLIEANKA`
3. `zhaxia520` — 炸蝦君 — `ZHAXIA520`
4. `yukiha` — 雪羽 Yuki — `YUKIHA`
5. `xunbaomao` — 尋寶喵 — `XUNBAOMAO`
6. `aone_nao` — 蒼音夏緒 — `AONE NAO`
7. `sabina` — 人偶．薩賓娜／薩琪 — `SABINA`
8. `yabi` — 牙白不牙白 — `YABI`
9. `ucrhlzl1kx0bzsiehkrfakrg` — 芽瑪 — `YAMA`
10. `quindaizier` — 奎因黛希爾 — `QUINDAIZIER`
11. `ribi` — 莉比 Ribi — `RIBI`
12. `pyonchan` — ぴょんちゃん兔兔 — `PYONCHAN`
13. `skymeowu` — 仙喵 SkyMeowu — `SKYMEOWU`
14. `chimera` — 奇美拉圈圈 — `CHIMERA`
15. `luby_abby` — 露比艾比 Luby Abby — `LUBY ABBY`
16. `maple` — 阿楓轟炸 — `MAPLE`
17. `aquariusgirl` — 水瓶罐子 — `AQUARIUS`
18. `fingla` — 芬格拉 Fingla — `FINGLA`
19. `xueying` — 雪迎 — `XUEYING`
20. `maruru` — 瑪露露 Maruru — `MARURU`
21. `koiyuki` — 白熊 恋雪 — `KOIYUKI`
22. `miyuki_aimu` — 深雪あいむ — `MIYUKI AIMU`
23. `kinkinko` — 金金子 — `KINKINKO`
24. `snowfox` — 雪下靈狐 — `SNOWFOX`
25. `delvi` — 黛菲 Delvi — `DELVI`
26. `yufang` — 月下香幽芳 YuFang — `YUFANG`
27. `aya` — 赤羽亞矢 AYA — `AYA`
28. `shiki` — 嘻希呦 — `SHIKI`
29. `tsugumi` — 黛鶇 — `TSUGUMI`
30. `elina` — 宮森えりな — `ELINA`
31. `yukichan` — 小雪 Yukichan — `YUKICHAN`
32. `aki` — Aki 安希 — `AKI`
33. `hanasaki` — 魔法少女花咲 — `HANASAKI`
34. `somaru` — 水縹そまる — `SOMARU`

Each record is atomic: `creatorId`, display name, romanized label, and avatar path must always move together. Chinese, English, and Japanese pages use the same records and creator names; only the surrounding section interface remains localized.

The top lane receives records 1–17 and the bottom lane receives records 18–34. Both lanes must use the same card width, gap, and absolute pixel speed. Row placement is not a ranking and does not change card styling.

## Fair continuous rotation

Keep the fairness model of the existing marquee rather than adding daily reordering:

- every creator travels the full visible path in a seamless loop;
- both lanes move at 44 pixels per second, which yields a 72.6-second loop for 17 cards at the approved width and gap;
- the bottom lane uses the reversed animation direction with the same 72.6-second duration;
- neither lane pauses independently;
- no popularity, sales, manual favorite, or featured flag affects order or presentation;
- the duplicate sequence required for a seamless loop is decorative and receives `aria-hidden="true"`.

Because each lane contains the same number of equal-width cards with the same gaps, equal pixel speed produces equal loop duration and exposure.

## Image integrity and performance

Generate a dedicated 160 × 160 WebP thumbnail for every canonical creator from that creator's verified production avatar. Use normalized filenames based on `creatorId` under `assets/creators/marquee/`.

Runtime requirements:

- every card references only its mapped local WebP thumbnail;
- no marquee card downloads the original full-resolution production image;
- each thumbnail is at most 80 KiB;
- all 34 unique thumbnails total at most 2 MiB;
- every image declares `width="160"`, `height="160"`, `loading="lazy"`, and `decoding="async"`;
- meaningful alternative text equals the mapped display name for the accessible sequence;
- decorative loop duplicates use empty alternative text and `aria-hidden="true"` at the card level;
- a failed image leaves the name visible over the existing neutral avatar background.

The original source images may remain in the repository when another page or historical design still needs them, but the marquee must not reference them.

## Interaction and accessibility

- Hovering either lane pauses both lanes.
- Keyboard focus anywhere inside the marquee pauses both lanes.
- With `prefers-reduced-motion: reduce`, animation is disabled, the edge mask and decorative duplicate sequence are hidden, and each lane becomes manually horizontally scrollable.
- The two non-duplicated 17-card sequences are the accessibility source of truth.
- Duplicate loop cards must not create repeated screen-reader announcements or focus targets.
- No name may overflow its card at desktop or mobile widths.

## Responsive behavior

Desktop cards use a 178 px fixed width and 66 px minimum height. Mobile cards may reduce to 166 px while preserving the 42 px avatar and bounded text column. Lane gaps remain equal in both directions.

The roster container keeps the existing edge fade on animated layouts. Mobile retains two lanes rather than collapsing to a grid or a single row.

## Localization and files

Update these pages together:

- `index.html`
- `en/index.html`
- `ja/index.html`

All three pages contain identical creator IDs, display names, romanized labels, avatar paths, lane assignment, duplicate structure, and animation behavior. Existing localized headings, metric labels, metadata, and navigation are unchanged.

Prefer one shared marquee stylesheet and one shared canonical data source or generation mechanism so the three static pages cannot silently drift. The final HTML must remain usable without JavaScript; JavaScript is not required for daily ordering because no daily reordering is part of this design.

## Verification

Add automated checks that fail when:

- a locale contains anything other than 34 unique accessible creator cards;
- creator IDs, names, labels, avatar paths, order, or lane assignment differ across locales;
- a creator ID is paired with the wrong display name or avatar filename;
- either lane contains anything other than 17 accessible cards;
- a referenced WebP file is missing, larger than 80 KiB, or not 160 × 160;
- the 34 unique thumbnail files exceed 2 MiB in total;
- duplicate cards are not hidden from assistive technology;
- the two lanes use different card dimensions, gaps, or pixel speeds;
- the upper lane does not move left or the lower lane does not move right;
- reduced-motion and pause behavior are absent;
- long-name overflow protections are removed.

Run the complete Node test suite, `git diff --check`, and a Wrangler dry run before publishing. After pushing `main`, require a successful Cloudflare Workers build and verify all three production locales contain 34 correctly mapped creators in two lanes with no Hall of Voices assets.

## Scope

This work changes only the website roster presentation, the 34 mapped thumbnail assets, shared marquee styling or data, tests, and related implementation documentation. It does not modify Firestore, the Vwake App, creator contracts, sales data, Cloudflare account settings, the existing metrics, or unrelated site sections.
