# Hall of Voices Roster Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the three localized marquee rosters with a premium, fair, daily rotating Hall of Voices containing all 34 currently active public Vwake creators.

**Architecture:** Each localized HTML page contains the same accessible 34-card roster snapshot and localized section copy. A shared ES module computes the Asia/Taipei daily rotation and builds decorative spotlight cards, while a shared stylesheet owns the responsive Hall of Voices presentation. All avatars are local static assets.

**Tech Stack:** Static HTML/CSS, browser ES modules, Node.js built-in test runner, Cloudflare Workers Static Assets

## Global Constraints

- Include exactly the 34 active, non-internal creators recorded in `docs/superpowers/specs/2026-08-07-hall-of-voices-roster-design.md`.
- Keep creator names identical across Chinese, English, and Japanese pages; localize only surrounding interface copy.
- Center, secondary A, and secondary B offsets are exactly `0`, `11`, and `23` over a 34-day cycle.
- Every creator must receive each spotlight position exactly once per cycle.
- Keep the existing `30+` metric unchanged.
- Use only local avatar files at runtime; do not modify Firestore or the Vwake App.

---

### Task 1: Specify the roster and fairness behavior

**Files:**
- Create: `tests/hall-of-voices-roster.test.mjs`
- Create: `assets/hall-of-voices.mjs`

**Interfaces:**
- Consumes: `[data-hall-of-voices]`, `[data-hall-roster]`, `[data-creator-id]`, and `data-spotlight-offsets="0,11,23"` from each localized page.
- Produces: `spotlightIndexes(dayNumber, rosterLength, offsets)`, `rotateRoster(items, offset)`, `taipeiDayNumber(date)`, and `initHallOfVoices(root)` exports.

- [x] **Step 1: Write the failing Node tests**

Create a table for `index.html`, `en/index.html`, and `ja/index.html`. Extract the Hall section and assert this exact ordered ID list:

```js
const expectedIds = [
  'shiori', 'allieanka', 'zhaxia520', 'yukiha', 'xunbaomao', 'aone_nao',
  'sabina', 'yabi', 'ucrhlzl1kx0bzsiehkrfakrg', 'quindaizier', 'ribi',
  'pyonchan', 'skymeowu', 'chimera', 'luby_abby', 'maple', 'aquariusgirl',
  'fingla', 'xueying', 'maruru', 'koiyuki', 'miyuki_aimu', 'kinkinko',
  'snowfox', 'delvi', 'yufang', 'aya', 'shiki', 'tsugumi', 'elina',
  'yukichan', 'aki', 'hanasaki', 'somaru',
];
```

For each page, assert 34 unique cards, identical IDs/names/avatar paths, `data-spotlight-offsets="0,11,23"`, and absence of `roster-marquee`, `roster-track`, `aria-hidden="true"` duplicated roster cards, and `@keyframes roster-scroll`. Check every card image path exists on disk.

Import `assets/hall-of-voices.mjs`; if it does not exist, fail with `Hall module must exist`. Simulate days `0..33` using `spotlightIndexes` and assert each ID appears once in every slot. Assert `rotateRoster(expectedIds, 1)` moves the first ID to the end without mutating the input.

- [x] **Step 2: Run the focused test and verify RED**

Run: `node --test tests/hall-of-voices-roster.test.mjs`

Expected: FAIL because the pages still contain 18-person marquees and the shared module does not exist.

- [x] **Step 3: Implement the pure rotation module**

Create `assets/hall-of-voices.mjs` with:

```js
export function spotlightIndexes(dayNumber, rosterLength, offsets = [0, 11, 23]) {
  if (!Number.isInteger(rosterLength) || rosterLength <= 0) return [];
  return offsets.map((offset) => ((dayNumber + offset) % rosterLength + rosterLength) % rosterLength);
}

export function rotateRoster(items, offset) {
  if (items.length === 0) return [];
  const start = ((offset % items.length) + items.length) % items.length;
  return [...items.slice(start), ...items.slice(0, start)];
}

export function taipeiDayNumber(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return Math.floor(Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day)) / 86400000);
}
```

`initHallOfVoices(root)` must read cards and offsets, clone the selected cards into the three decorative spotlight slots with empty `alt`, unhide the stage, rotate the full roster DOM by the same daily offset, and write the localized Taipei date into `[data-rotation-date]`. Auto-run it for every `[data-hall-of-voices]` root when `document` exists.

- [x] **Step 4: Keep the focused test red for the intended page gap**

Run: `node --test tests/hall-of-voices-roster.test.mjs`

Expected: rotation unit assertions pass, while page assertions still fail because the Hall markup is not implemented yet.

### Task 2: Sync the production creator avatars

**Files:**
- Create: `assets/creators/avatars/{creatorId}.png` for PNG sources
- Create: `assets/creators/avatars/{creatorId}.jpg` for `xueying`, `miyuki_aimu`, `kinkinko`, and `yukichan`

**Interfaces:**
- Consumes: the 34 public production avatar URLs captured from active Firestore `voice_packs` documents.
- Produces: normalized local avatar paths referenced identically by all three pages.

- [x] **Step 1: Download all 34 avatars with fail-fast HTTP checks**

Use `curl -fL --retry 2` and normalized creator-ID filenames. Preserve the source extension. Do not overwrite or delete legacy avatar aliases.

- [x] **Step 2: Validate every image**

Run `file assets/creators/avatars/{normalized files}` and require PNG or JPEG output for all 34 files. Run `find assets/creators/avatars -type f -size 0` and require no output.

### Task 3: Build the localized Hall of Voices

**Files:**
- Create: `assets/hall-of-voices.css`
- Modify: `index.html`
- Modify: `en/index.html`
- Modify: `ja/index.html`
- Modify: `tests/alarm-rings-stat.test.mjs`

**Interfaces:**
- Consumes: the shared module, shared stylesheet, normalized local avatars, exact roster IDs, display names, and short romanized labels.
- Produces: three equivalent Hall sections with localized headings and the same accessible roster dataset.

- [x] **Step 1: Add the shared responsive stylesheet**

Implement the approved dark editorial frame, 1.55fr/0.8fr/0.8fr spotlight stage, large center-stage typography, equal circular roster cards, coral rotation badge, neutral image fallback, desktop dense grid, and mobile center-plus-two stage with a two-column full roster. Hide `[data-hall-stage]` by default and reveal it through a `.hall-enhanced` class set by JavaScript.

- [x] **Step 2: Replace the Chinese marquee**

Remove marquee-only CSS and markup. Add the stylesheet link and module script. Preserve the existing stats. Add localized copy:

```html
<div class="section-label">On Vwake · Hall of Voices</div>
<h2 class="section-title">每一段聲音，都在點亮粉絲的早晨。</h2>
```

Render three empty decorative spotlight slots and the complete 34-card roster. Each card includes `data-creator-id`, `.hall-card-name`, `.hall-card-meta`, and a local `<img width="96" height="96" loading="lazy" decoding="async">`.

- [x] **Step 3: Replace the English and Japanese marquees**

Use the identical IDs, names, labels, and paths. Localized headings:

```html
<!-- English -->
<div class="section-label">On Vwake · Hall of Voices</div>
<h2 class="section-title">Every voice lights up someone’s morning.</h2>

<!-- Japanese -->
<div class="section-label">On Vwake · Hall of Voices</div>
<h2 class="section-title">すべての声が、ファンの朝を照らしている。</h2>
```

Update the existing alarm-rings statistic test helper so it bounds the stats block using the new Hall wrapper instead of the removed `.roster-marquee` marker. Keep all statistic values and style assertions unchanged.

- [x] **Step 4: Run the focused test and verify GREEN**

Run: `node --test tests/hall-of-voices-roster.test.mjs`

Expected: all Hall roster, asset, localization-consistency, and 34-day fairness tests pass.

### Task 4: Verify, publish, and record completion

**Files:**
- Modify: `docs/superpowers/plans/2026-08-07-hall-of-voices-roster.md` checkbox state only

**Interfaces:**
- Consumes: completed HTML, CSS, module, tests, and avatar assets.
- Produces: verified commits on `origin/main` and a successful Cloudflare production deployment.

- [x] **Step 1: Run complete local verification**

Run:

```bash
node --test tests/*.test.mjs
git diff --check
npx wrangler deploy --dry-run --outdir /tmp/vwake-hall-dry-run
```

Expected: all tests pass, no whitespace errors, and Wrangler exits 0 without an asset-size error.

- [x] **Step 2: Commit the implementation**

```bash
git add assets/hall-of-voices.css assets/hall-of-voices.mjs assets/creators/avatars tests/hall-of-voices-roster.test.mjs index.html en/index.html ja/index.html docs/superpowers/plans/2026-08-07-hall-of-voices-roster.md
git commit -m "feat(site): add fair Hall of Voices roster"
```

- [x] **Step 3: Push and monitor automatic deployment**

Run `git push origin main`, then query GitHub check runs for the pushed commit. Require `Workers Builds: vwake-website` to complete with conclusion `success`.

- [x] **Step 4: Inspect production**

Fetch `https://vwake.app/`, `/en/`, and `/ja/` with a commit cache-buster. Require each page to contain `data-hall-of-voices`, all 34 creator IDs, the shared module, and no `roster-marquee`. Confirm local HEAD equals `origin/main`, the worktree is clean, and mark every plan checkbox complete in a final documentation commit.
