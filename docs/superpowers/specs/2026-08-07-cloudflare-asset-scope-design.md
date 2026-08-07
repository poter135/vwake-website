# Cloudflare Asset Scope Fix

## Goal

Restore automatic Cloudflare deployment without changing the public website by preventing repository-only files from being uploaded as Workers static assets.

## Root cause

`wrangler.jsonc` sets `assets.directory` to the repository root. Wrangler therefore scans repository metadata as public assets. The failed build attempted to upload a 33.7 MiB file from `.git/objects/pack`, exceeding Cloudflare's 25 MiB per-asset limit.

## Considered approaches

1. Add a root `.assetsignore` file. This is the recommended option because Cloudflare officially supports it, it preserves all current public URLs, and it requires no build step.
2. Move public files into a dedicated `public/` directory. This creates a cleaner boundary but requires moving every page and asset and carries unnecessary path-regression risk.
3. Add a build script that copies an explicit allowlist into a deployment directory. This gives the strongest boundary but adds tooling and maintenance to a static site that currently has no build system.

## Design

Keep `assets.directory` set to `.` and add `.assetsignore` using gitignore-style patterns. Exclude repository metadata, local tooling state, tests, internal documentation, task tracking, deployment configuration, and unused source artwork. Keep the public HTML pages, localized directories, `robots.txt`, `sitemap.xml`, runtime `assets/`, and the `store_preview/` images referenced by the pages.

The initial exclusions are:

- `.git`, `.gitignore`, `.gstack`, `.superpowers`, and `.wrangler`
- `docs`, `tests`, and `TODO.md`
- `wrangler.jsonc`
- `new icon`
- `assets/*.source.html`

## Verification

Add a regression test that checks the deployment boundary contains the required exclusions while preserving every known public root. Run the complete Node test suite. Run Wrangler's dry-run deployment and inspect its asset inventory to confirm no `.git` asset is collected and no file exceeds Cloudflare's limit. After pushing, verify the triggered Cloudflare build succeeds and the production page serves the new premium-creator copy.

## Scope

This change only affects which repository files Cloudflare uploads. It does not change page content, routing, domains, or Cloudflare account settings.
