# Cloudflare Asset Scope Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore automatic Cloudflare deployment by preventing repository-only files from being uploaded as static website assets.

**Architecture:** Keep the current zero-build static-site layout and use Cloudflare's supported root `.assetsignore` boundary. Wrangler's own dry-run is the regression reproducer: it must fail on the oversized Git pack before the change and complete without collecting it after the change.

**Tech Stack:** Cloudflare Workers Static Assets, Wrangler 4, Node.js built-in test runner

## Global Constraints

- Do not change public page content, routing, domains, or Cloudflare account settings.
- Preserve `index.html`, localized pages, `assets/`, and `store_preview/` as deployable assets.
- Exclude Git metadata, local tooling, tests, internal documentation, task tracking, Wrangler configuration, and unused source artwork.

---

### Task 1: Lock and implement the asset boundary

**Files:**
- Create: `.assetsignore`

**Interfaces:**
- Consumes: Wrangler's gitignore-style `.assetsignore` support at the configured `assets.directory` root.
- Produces: A root deployment-ignore file that changes Wrangler's actual asset inventory.

- [x] **Step 1: Reproduce the failing deployment inventory**

Create a temporary Wrangler fixture whose asset root contains `.git/objects/pack/oversized.pack` at 26 MiB, then run: `npx wrangler deploy --dry-run --outdir /tmp/vwake-wrangler-fixture-output`

Expected: FAIL with `Asset too large` for `.git/objects/pack/*.pack`, reproducing the production build failure.

- [x] **Step 2: Add the minimal Cloudflare ignore file**

```gitignore
# Repository and local tooling
**/.git
.gitignore
.gstack
.superpowers
.wrangler
.vscode
.idea
**/.DS_Store
**/Thumbs.db
**/desktop.ini
**/node_modules
.dev.vars*
.env*

# Internal project files
docs
tests
TODO.md
wrangler.jsonc

# Source material not referenced by the website
new icon
assets/*.source.html
```

- [x] **Step 3: Run the complete content tests**

Run: `node --test tests/*.test.mjs`

Expected: all tests pass.

- [x] **Step 4: Verify Wrangler's corrected deploy inventory**

Run: `npx wrangler deploy --dry-run --outdir /tmp/vwake-wrangler-dry-run`

Expected: exit 0, no `.git` asset collected, and no asset-size error.

- [x] **Step 5: Commit the implementation**

```bash
git add .assetsignore docs/superpowers/plans/2026-08-07-cloudflare-asset-scope.md
git commit -m "fix(deploy): exclude repository files from assets"
```

### Task 2: Publish and verify automatic deployment

**Files:**
- Modify: none

**Interfaces:**
- Consumes: GitHub `main` push and the existing Cloudflare Workers Builds integration.
- Produces: A successful Cloudflare production build serving the latest website commit.

- [x] **Step 1: Push the implementation**

Run: `git push origin main`

Expected: GitHub accepts the new commits and triggers `Workers Builds: vwake-website`.

- [x] **Step 2: Monitor the triggered check**

Run: `gh api repos/poter135/vwake-website/commits/HEAD/check-runs`

Expected: `Workers Builds: vwake-website` completes with conclusion `success`.

- [x] **Step 3: Verify production content**

Run: `curl -fsSL "https://vwake.app/?deploy-check=<commit>"`

Expected: the response includes the latest premium-creator title and `5000+`, proving production serves the new deployment rather than the previous build.

Verified for implementation commit `70c14d2`: Cloudflare build `2aad9726-9ce2-4127-a7e7-7169aac6e52f` completed successfully, and production returned the expected title, `5000+`, and `鬧鐘語音響起`.
