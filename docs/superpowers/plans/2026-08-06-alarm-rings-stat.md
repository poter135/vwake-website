# Alarm Rings Stat Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the weak roster statistics with concise `5000+` alarm-rings and `30+` VTuber metrics across all three locales.

**Architecture:** Keep the site dependency-free and static. A Node built-in test reads the three HTML documents and checks roster markup, locale copy, removed metrics, and the original roster-stat CSS; the implementation changes only roster-stat markup in each localized page.

**Tech Stack:** Static HTML/CSS, Node.js built-in `node:test`, Git.

## Global Constraints

- `5000+` is a cumulative alarm-ring event count, not unique users, dates, or mornings.
- Keep only `5000+` and `30+`, using the original equal-weight roster-stat format.
- Remove the `100+` voice count and `1500+` user count from the roster-stat area.
- Preserve the existing purple gradient, sizing, spacing, and VTuber marquee.
- Add no API, backend, framework, or runtime dependency.

---

### Task 1: Encode the localized roster-stat contract

**Files:**
- Create: `tests/alarm-rings-stat.test.mjs`

**Interfaces:**
- Consumes: `index.html`, `en/index.html`, and `ja/index.html` as UTF-8 text.
- Produces: a Node test suite that validates `.roster-stats` content and responsive styling.

- [x] **Step 1: Write the failing test**

Create a `node:test` suite that extracts each `<div class="roster-stats">…</div>` block. Assert that the locale-specific block contains exactly two `.rstat` items with the alarm-rings and VTuber values; assert that it excludes `100+`, `1500+`, and special visual-hierarchy classes; assert each page retains the original roster-stat spacing and mobile sizing.

- [x] **Step 2: Run test to verify it fails**

Run: `node --test tests/alarm-rings-stat.test.mjs`

Expected: FAIL because the current roster blocks do not contain `5000+`.

- [x] **Step 3: Commit the red test with the implementation task**

Do not commit the deliberately failing state separately; proceed directly to Task 2 while preserving evidence of the failing run in the working session.

### Task 2: Implement the concise roster statistics

**Files:**
- Modify: `index.html`
- Modify: `en/index.html`
- Modify: `ja/index.html`
- Test: `tests/alarm-rings-stat.test.mjs`

**Interfaces:**
- Consumes: the exact HTML contract asserted by Task 1.
- Produces: localized, responsive roster statistics with two equal-weight metrics.

- [x] **Step 1: Preserve roster-stat CSS in each page**

Keep the existing `.roster-stats`, `.rstat`, `.rstat-num`, `.rstat-label`, `.rstat-sep`, and mobile rules unchanged. Add no glow, enlarged primary number, supporting paragraph, or special hierarchy class.

- [x] **Step 2: Replace roster-stat HTML in each page**

Use these exact localized values:

- Chinese: `5000+`, `鬧鐘語音響起`, `30+`, `VTuber 已上架`.
- English: `5,000+`, `alarm wake-ups`, `30+`, `VTubers live`.
- Japanese: `5,000+`, `アラームが鳴った回数`, `30+`, `VTuber 出品中`.

- [x] **Step 3: Run the focused test**

Run: `node --test tests/alarm-rings-stat.test.mjs`

Expected: PASS for all locale and style assertions.

- [x] **Step 4: Run repository checks**

Run: `git diff --check` and inspect `git diff -- index.html en/index.html ja/index.html tests/alarm-rings-stat.test.mjs`.

Expected: no whitespace errors; only the intended roster-stat CSS, markup, and test change.

- [x] **Step 5: Commit**

Run:

```bash
git add docs/superpowers/plans/2026-08-06-alarm-rings-stat.md tests/alarm-rings-stat.test.mjs index.html en/index.html ja/index.html
git commit -m "feat(site): highlight alarm wake-up count"
```

### Task 3: Verify and publish

**Files:**
- Verify: `index.html`
- Verify: `en/index.html`
- Verify: `ja/index.html`
- Verify: `tests/alarm-rings-stat.test.mjs`

**Interfaces:**
- Consumes: the committed implementation.
- Produces: a tested commit pushed to the configured upstream branch.

- [x] **Step 1: Re-run final verification**

Run: `node --test tests/alarm-rings-stat.test.mjs && git diff --check && git status --short`.

Expected: tests pass, no whitespace errors, and the worktree is clean.

- [x] **Step 2: Push**

Run: `git push origin HEAD`.

Expected: the current branch is successfully updated on `origin`.
