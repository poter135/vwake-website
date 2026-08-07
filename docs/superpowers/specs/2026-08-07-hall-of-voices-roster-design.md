# Hall of Voices Roster Design

## Goal

Replace the continuously scrolling “On Vwake” marquee with a more premium presentation that reflects the complete live App catalog while giving every creator equal long-term exposure.

## Source of truth

The roster is a static website snapshot of the production Firestore `voice_packs` catalog. Include one creator for each distinct `vtuberId` that has at least one document where `isActive == true`; exclude documents with `internal == true`, sentinel IDs such as `free`, and IDs beginning with `_`.

The snapshot verified on 2026-08-07 contains 34 creators:

1. 小原栞
2. 艾莉安卡
3. 炸蝦君
4. 雪羽 Yuki
5. 尋寶喵
6. 蒼音夏緒
7. 人偶．薩賓娜／薩琪
8. 牙白不牙白
9. 芽瑪
10. 奎因黛希爾
11. 莉比 Ribi
12. ぴょんちゃん兔兔
13. 仙喵 SkyMeowu
14. 奇美拉圈圈
15. 露比艾比 Luby Abby
16. 阿楓轟炸
17. 水瓶罐子
18. 芬格拉 Fingla
19. 雪迎
20. 瑪露露 Maruru
21. 白熊 恋雪
22. 深雪あいむ
23. 金金子
24. 雪下靈狐
25. 黛菲 Delvi
26. 月下香幽芳 YuFang
27. 赤羽亞矢 AYA
28. 嘻希呦
29. 黛鶇
30. 宮森えりな
31. 小雪 Yukichan
32. Aki 安希
33. 魔法少女花咲
34. 水縹そまる

Creator stage names are proper names and remain the same across Chinese, English, and Japanese pages. Only the section heading, supporting copy, accessibility labels, and rotation explanation are localized.

## Visual design

Use the approved “rotating Hall of Voices” direction:

- A full-width dark editorial frame establishes the section as a premium brand roster.
- The header carries the `On Vwake · Hall of Voices` label, a localized statement, the creator count, and a small daily-rotation indicator.
- The daily stage contains one large center-stage card and two equal secondary spotlight cards.
- The complete 34-person roster remains visible below as equal-size circular portrait cards; spotlight placement never removes anyone from the full roster.
- Desktop uses a three-column spotlight composition and a dense portrait wall. Mobile stacks the center card above two secondary cards and renders the full roster in two columns.
- Preserve the surrounding page’s current dark palette and coral accent. The visual hierarchy comes from typography, spacing, framing, and the rotating stage—not permanent creator ranking.

## Fairness model

The roster array has a stable canonical order. Compute one date seed from the current calendar date in `Asia/Taipei`, so every visitor sees the same daily stage.

For roster length `N = 34` and daily offset `d`:

- Center stage: `d mod N`
- Secondary stage A: `(d + 11) mod N`
- Secondary stage B: `(d + 23) mod N`
- Full roster begins at `d mod N` and wraps around, while every full-roster card keeps identical styling.

As `d` advances through a 34-day cycle, every creator occupies each of the three spotlight positions exactly once and begins the full roster exactly once. No random choice, sales metric, manual favorite, or permanent featured flag influences exposure.

JavaScript enhances the stage and daily order from one embedded roster dataset. Without JavaScript, the complete canonical roster remains visible and usable; the stage may show the first canonical trio. The full roster is the accessibility source of truth, and decorative spotlight duplicates must not create repeated screen-reader announcements.

## Data and assets

- Embed one canonical roster dataset per page with stable creator ID, display name, romanized short label, and local avatar path.
- Download the current production avatar for all 34 creators into `assets/creators/avatars/` using normalized creator-ID filenames. The deployed page must not depend on Firebase Storage at runtime.
- Keep existing image files unless they are safely proven unused; this change does not require destructive cleanup.
- Use explicit width and height attributes, `loading="lazy"` for the full roster, `decoding="async"`, meaningful `alt` text in the roster, and empty alternative text for decorative spotlight copies.
- If an image fails, retain the creator name and show the existing neutral avatar background rather than hiding the card.

## Localization

Update `index.html`, `en/index.html`, and `ja/index.html` together. All three pages must contain the same 34 creator IDs, names, order, rotation offsets, and avatar files. Localized section copy may differ, but no locale may contain a stale or partial roster.

The existing `30+` metric remains accurate and unchanged. The marquee animation, duplicated `aria-hidden` roster, and marquee-only CSS are removed from all three pages.

## Testing

Add Node tests that extract the canonical roster from every locale and verify:

- exactly 34 unique creator IDs appear in the full roster;
- the IDs, names, order, and avatar paths match across all three locales;
- every referenced local avatar exists;
- the old marquee container and duplicated hidden roster are absent;
- spotlight offsets are exactly `0`, `11`, and `23`;
- a simulated 34-day cycle gives every creator each spotlight position exactly once;
- the existing title, premium copy, and alarm-stat tests remain green.

Run the complete Node suite and a Wrangler dry-run before publishing. After pushing `main`, require a successful Cloudflare Workers build and inspect the live Chinese, English, and Japanese roster sections.

## Scope

This change updates only the website’s roster data, presentation, local creator avatars, tests, and related design/implementation documentation. It does not modify Firestore, the Vwake App, creator contracts, sales data, Cloudflare account settings, or the existing `30+` metric.
