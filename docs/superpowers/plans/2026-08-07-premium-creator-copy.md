# Premium Creator Copy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align the three localized homepage descriptions and value proposition with Vwake's approved premium creator positioning, then publish and verify the result.

**Architecture:** Keep the dependency-free static pages unchanged except for four description surfaces and the third Why Vwake pillar in each locale. A Node built-in contract test parses those exact surfaces, rejects the old low-investment language, and protects localization parity before the existing suite and production smoke checks run.

**Tech Stack:** Static HTML, JSON-LD, Node.js built-in `node:test`, Git, curl.

## Global Constraints

- Implement the exact strings in `docs/superpowers/specs/2026-08-06-premium-creator-copy-design.md`.
- Modify only homepage description metadata, `SoftwareApplication.description`, and the third Why Vwake pillar.
- Preserve existing title metadata, other pillars, styling, roster metrics, legal pages, keywords, and assets.
- Add no dependency, framework, generated file, or backend.
- Do not use `一次錄音`, `被動收入`, `Record once`, `Passive Revenue`, `一度収録して`, or `長く稼ぐ` in the changed surfaces.
- Push `main` only after the full local suite passes and the worktree is clean.

---

### Task 1: Implement localized premium copy with TDD

**Files:**
- Create: `tests/premium-creator-copy.test.mjs`
- Modify: `index.html:7-54, 890-915`
- Modify: `en/index.html:7-54, 890-915`
- Modify: `ja/index.html:7-54, 890-915`
- Read: `docs/superpowers/specs/2026-08-06-premium-creator-copy-design.md`

**Interfaces:**
- Consumes: localized HTML strings and exact approved copy.
- Produces: one test per locale plus consistent premium metadata, JSON-LD, and third-pillar content in all locales.

- [x] **Step 1: Write the failing test**

Create `tests/premium-creator-copy.test.mjs` with a locale table containing the exact `meta`, `social`, `label`, `title`, `quote`, `description`, and `forbidden` values from the design spec. Implement these helpers:

```js
function requiredMatch(text, pattern, label) {
  const match = text.match(pattern);
  assert.ok(match, `${label} must exist`);
  return match[1];
}

function normalize(text) {
  return text.replace(/\s+/g, ' ').trim();
}

function thirdPillar(html) {
  return requiredMatch(
    html,
    /(<div class="pillar">\s*<div class="pillar-num">— 03[\s\S]*?<\/div>\s*<\/div>)/,
    'third Why Vwake pillar',
  );
}
```

For each locale, parse the three meta descriptions, the JSON-LD `SoftwareApplication.description`, and the third pillar's four class values. Assert exact equality and assert that every forbidden phrase is absent from the joined changed surfaces.

- [x] **Step 2: Run the focused test and verify red**

Run:

```bash
node --test tests/premium-creator-copy.test.mjs
```

Expected: three failures because the pages still contain the old transactional descriptions and passive-revenue pillar.

- [x] **Step 3: Replace the four description surfaces**

For each locale, use the design spec's Meta value for `<meta name="description">` and `SoftwareApplication.description`; use its Social value for `og:description` and `twitter:description`.

- [x] **Step 4: Replace the third pillar**

Replace the existing passive-revenue `pillar-num`, `pillar-title`, `pillar-quote`, and `pillar-desc` with the locale's exact Label, Title, Quote, and Description values from the design spec. Update the nearby HTML comment to `Lasting Value` or the localized equivalent without changing markup or styling.

- [x] **Step 5: Run focused and full verification**

Run:

```bash
node --test tests/premium-creator-copy.test.mjs
node --test
git diff --check
```

Expected: the focused tests pass 3/3, the complete suite passes with zero failures, and the diff check is clean.

- [x] **Step 6: Inspect scope and commit**

Run:

```bash
git diff -- index.html en/index.html ja/index.html tests/premium-creator-copy.test.mjs docs/superpowers/plans/2026-08-07-premium-creator-copy.md
```

Confirm no title, styling, other pillar, roster, legal, keyword, or asset changes. Then commit:

```bash
git add docs/superpowers/plans/2026-08-07-premium-creator-copy.md tests/premium-creator-copy.test.mjs index.html en/index.html ja/index.html
git commit -m "copy(site): align premium creator messaging"
```

### Task 2: Publish and verify production

**Files:**
- Verify: `index.html`, `en/index.html`, `ja/index.html`
- Verify: `TODO.md`

**Interfaces:**
- Consumes: a clean, tested local `main` commit.
- Produces: an updated `origin/main` and evidence-backed production status.

- [ ] **Step 1: Run the pre-push gate**

Run:

```bash
node --test
git diff --check
git status --short --branch
```

Expected: all tests pass, no whitespace errors, and the worktree is clean with local `main` ahead of `origin/main`.

- [ ] **Step 2: Push the authorized branch**

Run:

```bash
git push origin main
```

Expected: `origin/main` advances to the local HEAD commit.

- [ ] **Step 3: Wait for deployment and inspect live pages**

Poll the three production pages for the new localized meta description and third-pillar title, with a bounded wait. Also fetch `https://vwake.app/robots.txt` and `https://vwake.app/sitemap.xml` and require HTTP 200 plus the expected sitemap directive and localized URLs.

- [ ] **Step 4: Report exact delivery state**

Run `git ls-remote origin refs/heads/main`, compare it with `git rev-parse HEAD`, and report whether production contains the new copy. Leave Search Console, Bing, store, and social-account actions listed as user-authorized follow-ups rather than claiming they are complete. After verification, mark Task 2's four steps complete, commit this plan-only progress update with `docs(site): record premium copy deployment`, push it, and confirm the final remote HEAD again; no additional content verification is required because that commit changes documentation only.
