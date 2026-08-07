# Two-Row Creator Marquee Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the single-row 18-person roster with the approved two-row counterflow marquee containing all 34 correctly mapped creators and no more than 2 MiB of runtime thumbnails.

**Architecture:** Keep the three localized pages as static, no-JavaScript fallbacks. A shared stylesheet owns the two-lane counterflow behavior, while each page embeds the same two 17-person accessible sequences plus decorative duplicates. A Node test holds the canonical atomic mapping and proves that creator ID, display name, label, lane, and local WebP path remain identical across locales.

**Tech Stack:** Static HTML/CSS, WebP assets produced with macOS `sips` and `cwebp`, Node.js built-in test runner, Cloudflare Workers Static Assets

## Global Constraints

- Use exactly the 34 atomic creator mappings in `docs/superpowers/specs/2026-08-07-two-row-creator-marquee-design.md`.
- Upper lane contains canonical records 1–17 and moves left; lower lane contains records 18–34 and moves right.
- Desktop cards are 178 px wide with 10 px gaps and a 72.6-second loop; mobile cards are 166 px wide with a 68-second loop.
- Both lanes use the same dimensions and effective 44-pixels-per-second speed at each breakpoint.
- Every runtime avatar is a local 160 × 160 WebP, at most 80 KiB each and at most 2 MiB total.
- Creator names, IDs, labels, avatar filenames, lane assignments, and order are identical across Chinese, English, and Japanese pages.
- Keep the current localized headings, `5000+`/`5,000+` metrics, `30+` metric, and all unrelated page content unchanged.
- Duplicate loop sequences are decorative; reduced motion hides them and enables manual horizontal scrolling.

---

### Task 1: Lock the 34-person mapping and marquee contract with failing tests

**Files:**
- Create: `tests/two-row-creator-marquee.test.mjs`
- Modify: `tests/alarm-rings-stat.test.mjs`

**Interfaces:**
- Consumes: the three localized HTML files and `assets/creator-marquee.css`.
- Produces: a canonical `expectedCreators` fixture and validation for two accessible 17-card lanes, decorative duplicates, direction, dimensions, asset integrity, and locale parity.

- [x] **Step 1: Write the failing roster mapping test**

Create `tests/two-row-creator-marquee.test.mjs`. Define the exact 34 records from the approved spec as literals with `{ id, name, label, avatar: "/assets/creators/marquee/<id>.webp" }`. Extract markup between `<!-- CREATOR_MARQUEE_START -->` and `<!-- CREATOR_MARQUEE_END -->` from `index.html`, `en/index.html`, and `ja/index.html`.

Parse only cards inside `.creator-marquee-sequence:not([aria-hidden="true"])` and assert:

```js
assert.equal(top.length, 17);
assert.equal(bottom.length, 17);
assert.deepEqual([...top, ...bottom], expectedCreators);
assert.deepEqual(enRoster, zhRoster);
assert.deepEqual(jaRoster, zhRoster);
```

For every record, assert the image uses its mapped WebP, `alt` equals the mapped display name, and the file exists. Parse each WebP with a small RIFF/VP8X/VP8/VP8L dimension reader in the test and require `160 × 160`. Require every file to be `<= 80 * 1024` bytes and the 34 unique files to total `<= 2 * 1024 * 1024` bytes.

Assert each page contains exactly two duplicate sequences with `aria-hidden="true"`, every duplicate image has `alt=""`, and no duplicate card has a `tabindex`.

- [x] **Step 2: Write the failing shared behavior assertions**

Read `assets/creator-marquee.css` and assert the observable contract selectors exist:

```js
assert.match(css, /--marquee-card-width:\s*178px/);
assert.match(css, /--marquee-gap:\s*10px/);
assert.match(css, /animation-duration:\s*72\.6s/);
assert.match(css, /creator-marquee-lane--left[\s\S]*marquee-left/);
assert.match(css, /creator-marquee-lane--right[\s\S]*marquee-right/);
assert.match(css, /\.creator-marquee:hover[\s\S]*animation-play-state:\s*paused/);
assert.match(css, /\.creator-marquee:focus-within[\s\S]*animation-play-state:\s*paused/);
assert.match(css, /prefers-reduced-motion:\s*reduce/);
assert.match(css, /\.creator-marquee-sequence\[aria-hidden="true"\][\s\S]*display:\s*none/);
assert.match(css, /min-width:\s*0/);
assert.match(css, /-webkit-line-clamp:\s*2/);
```

- [x] **Step 3: Update the existing stats fragment boundary**

Change `tests/alarm-rings-stat.test.mjs` so `rosterFragment()` ends at `<!-- CREATOR_MARQUEE_START -->`. Do not change any expected metric numbers, labels, or style assertions.

- [x] **Step 4: Run the focused tests and verify RED**

Run:

```bash
node --test tests/two-row-creator-marquee.test.mjs tests/alarm-rings-stat.test.mjs
```

Expected: the new test fails because the pages still have a single `roster-marquee`, only 18 unique creators, no WebP asset set, and no shared stylesheet. The existing stats assertions continue to pass after the boundary update.

### Task 2: Produce the bounded 34-avatar WebP set

**Files:**
- Create: `assets/creators/marquee/<creatorId>.webp` for all 34 canonical IDs

**Interfaces:**
- Consumes: the verified normalized production avatars stored in Git commit `c997f78` under `assets/creators/avatars/`.
- Produces: 34 center-cropped 160 × 160 WebP thumbnails named exactly by canonical creator ID.

- [x] **Step 1: Extract the verified source images to a temporary directory**

Create a temporary directory with `mktemp -d`, then use `git archive c997f78 assets/creators/avatars` and extract it there. Do not restore the large source images into the current worktree.

- [x] **Step 2: Center-crop and encode every canonical image**

For each creator, use the source extension recorded in `c997f78` (`.jpg` only for `xueying`, `miyuki_aimu`, `kinkinko`, and `yukichan`; `.png` for all others). Read width and height using `sips -g pixelWidth -g pixelHeight`, crop to a centered square with `sips --cropToHeightWidth <min> <min>`, resample to 160 × 160 with `sips --resampleHeightWidth 160 160`, and encode with:

```bash
cwebp -quiet -q 78 <square-png> -o assets/creators/marquee/<creatorId>.webp
```

If any output exceeds 80 KiB, re-encode only that file at quality 70. Do not change creator IDs or substitute another creator's source image.

- [x] **Step 3: Validate the asset budget**

Run:

```bash
find assets/creators/marquee -type f -name '*.webp' | wc -l
du -k assets/creators/marquee/*.webp | sort -nr | head
du -sk assets/creators/marquee
```

Expected: 34 files, every file at most 80 KiB, total at most 2048 KiB.

- [x] **Step 4: Re-run the focused test**

Run `node --test tests/two-row-creator-marquee.test.mjs`.

Expected: asset existence, dimensions, and size-budget assertions pass; HTML and shared CSS assertions remain red.

### Task 3: Implement the shared two-row counterflow marquee

**Files:**
- Create: `assets/creator-marquee.css`
- Modify: `index.html`
- Modify: `en/index.html`
- Modify: `ja/index.html`

**Interfaces:**
- Consumes: the 34 mapped WebP assets and exact canonical order from the spec.
- Produces: two accessible 17-person sequences per locale and two decorative duplicates for seamless animation.

- [x] **Step 1: Create the shared stylesheet**

Implement `assets/creator-marquee.css` with these fixed variables and structures:

```css
.creator-marquee {
  --marquee-card-width: 178px;
  --marquee-card-height: 66px;
  --marquee-avatar-size: 42px;
  --marquee-gap: 10px;
}
.creator-marquee-track { display: flex; width: max-content; }
.creator-marquee-sequence {
  display: flex;
  gap: var(--marquee-gap);
  padding-right: var(--marquee-gap);
}
.creator-marquee-track { animation-duration: 72.6s; animation-timing-function: linear; animation-iteration-count: infinite; }
.creator-marquee-lane--left .creator-marquee-track { animation-name: marquee-left; }
.creator-marquee-lane--right .creator-marquee-track { animation-name: marquee-right; }
@keyframes marquee-left { to { transform: translateX(-50%); } }
@keyframes marquee-right { from { transform: translateX(-50%); } to { transform: translateX(0); } }
```

Cards use fixed border-box dimensions, an unshrinking 42 px portrait, `.creator-marquee-card-copy { flex: 1; min-width: 0; overflow: hidden; }`, and a two-line clamped name. Pause both tracks from wrapper `:hover` and `:focus-within` states.

At `max-width: 620px`, set the card width to 166 px and duration to 68s. Under `prefers-reduced-motion: reduce`, remove animation and transforms, remove the mask, hide decorative sequences, and make each lane `overflow-x: auto` with touch scrolling.

- [x] **Step 2: Replace the Chinese marquee**

Add `<link rel="stylesheet" href="/assets/creator-marquee.css">` in `<head>`. Remove the inline single-row marquee animation/card CSS but keep the existing stats CSS unchanged.

Replace the old roster wrapper with:

```html
<!-- CREATOR_MARQUEE_START -->
<div class="creator-marquee" tabindex="0" aria-label="Vwake 創作者名單">
  <div class="creator-marquee-lane creator-marquee-lane--left">
    <div class="creator-marquee-track">
      <div class="creator-marquee-sequence"><!-- creators 1–17 --></div>
      <div class="creator-marquee-sequence" aria-hidden="true"><!-- exact decorative duplicate --></div>
    </div>
  </div>
  <div class="creator-marquee-lane creator-marquee-lane--right">
    <div class="creator-marquee-track">
      <div class="creator-marquee-sequence"><!-- creators 18–34 --></div>
      <div class="creator-marquee-sequence" aria-hidden="true"><!-- exact decorative duplicate --></div>
    </div>
  </div>
</div>
<!-- CREATOR_MARQUEE_END -->
```

Each accessible card is an `<article class="creator-marquee-card" data-creator-id="...">` containing the mapped WebP and exact mapped text. Each decorative card keeps the same `data-creator-id`, uses `alt=""`, and is nested under the hidden sequence.

- [x] **Step 3: Replace the English and Japanese marquees**

Repeat the identical 34 records, order, lane split, labels, and avatar paths. Only localize the wrapper labels to `Vwake creator roster` and `Vwake クリエイター一覧`. Preserve all current localized section copy and metrics.

- [x] **Step 4: Run focused tests and verify GREEN**

Run:

```bash
node --test tests/two-row-creator-marquee.test.mjs tests/alarm-rings-stat.test.mjs
```

Expected: all mapping, lane, asset, styling, accessibility, localization-parity, and metric assertions pass.

- [x] **Step 5: Inspect desktop and mobile rendering**

Serve the repository locally and inspect `/#roster`, `/en/#roster`, and `/ja/#roster`. At desktop width, require two smooth opposite lanes, bounded two-line names, six or seven visible cards per lane, and no horizontal page overflow. At 390 × 844, require two or three visible cards per lane, no text overlap, and no horizontal page overflow. Enable reduced motion and verify duplicates are hidden and both lanes can be manually scrolled.

### Task 4: Verify and publish

**Files:**
- Modify: `docs/superpowers/plans/2026-08-07-two-row-creator-marquee.md` checkbox state only

**Interfaces:**
- Consumes: completed pages, stylesheet, images, and tests.
- Produces: verified commits on `origin/main` and a successful Cloudflare production deployment.

- [x] **Step 1: Run full local verification**

Run:

```bash
node --test tests/*.test.mjs
git diff --check
npx --yes wrangler deploy --dry-run --outdir /tmp/vwake-two-row-dry-run
```

Expected: all tests pass, no whitespace errors, Wrangler reads all assets and exits 0.

- [x] **Step 2: Commit the implementation**

Stage only the shared CSS, 34 WebPs, three HTML pages, the two affected test files, and this plan. Commit with `feat(site): add two-row creator marquee`.

- [x] **Step 3: Push and monitor deployment**

Push `main`, then query the check run for the new commit. Require `Workers Builds: vwake-website` to finish with conclusion `success`.

- [x] **Step 4: Verify production and finish the record**

Fetch `https://vwake.app/`, `/en/`, and `/ja/` with a commit cache-buster. Require each page to contain the start/end markers, 34 accessible creator cards split 17/17, two decorative sequences, the shared stylesheet, no Hall of Voices markup, and no old `roster-marquee` wrapper. Verify representative WebPs return 200 and that local `HEAD` equals `origin/main`. Mark every checkbox complete in a final documentation commit, push it, monitor the final check, and require a clean worktree.
