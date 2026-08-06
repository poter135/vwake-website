# Premium Page Title Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace transactional homepage title metadata with premium creator positioning in Traditional Chinese, English, and Japanese.

**Architecture:** Keep the static HTML structure unchanged and update only the three title surfaces in each localized homepage. A dependency-free Node test reads the documents and validates exact localized values plus removal of the old transactional phrases from title metadata.

**Tech Stack:** Static HTML, Node.js built-in `node:test`, Git.

## Global Constraints

- Update only homepage `<title>`, `og:title`, and `twitter:title` metadata.
- Preserve descriptions, body copy, structured data, legal pages, and all visual styling.
- Chinese title: `Vwake｜VTuber 語音鬧鐘平台 — 讓你的聲音，成為粉絲每天的第一刻`.
- English title: `Vwake | VTuber Voice Alarm Platform — Be the First Voice Your Fans Hear Each Day`.
- Japanese title: `Vwake｜VTuber音声目覚ましプラットフォーム — あなたの声を、ファンの一日の始まりに`.

---

### Task 1: Encode and implement localized title metadata

**Files:**
- Create: `tests/premium-page-title.test.mjs`
- Modify: `index.html`
- Modify: `en/index.html`
- Modify: `ja/index.html`

**Interfaces:**
- Consumes: the three localized homepage files as UTF-8 text.
- Produces: exact, consistent browser and social-sharing titles in each locale.

- [x] **Step 1: Write the failing test**

Create a `node:test` table with each homepage path and its exact expected title. Extract `<title>`, `<meta property="og:title">`, and `<meta name="twitter:title">`; assert all three equal the localized expected value. Within those three values, assert the old locale phrase is absent: `一次錄音`, `Record once`, or `一度収録して`.

- [x] **Step 2: Run the focused test and verify red**

Run: `node --test tests/premium-page-title.test.mjs`

Expected: three failures because the current homepage metadata still contains the old titles.

- [x] **Step 3: Update the three title surfaces in each homepage**

Replace only `<title>`, `og:title`, and `twitter:title` using the exact Global Constraints strings. Do not alter description metadata or visible body content.

- [x] **Step 4: Run all tests and static checks**

Run: `node --test && git diff --check`.

Expected: all alarm-stat and page-title tests pass; no whitespace errors.

- [x] **Step 5: Refresh the local preview**

Reload `http://127.0.0.1:4173/#roster` and verify the browser tab title is the approved Chinese string while the visible page remains unchanged.

- [x] **Step 6: Commit**

Run:

```bash
git add docs/superpowers/plans/2026-08-06-premium-page-title.md tests/premium-page-title.test.mjs index.html en/index.html ja/index.html
git commit -m "copy(site): elevate creator page titles"
```
