import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { handleRequest } from '../src/creator-link-worker.mjs';

const endpoint = 'https://example.cloudfunctions.net/creatorLinkRedirect';
const token = 'test-only-secret';

function assets() {
  const calls = [];
  return {
    calls,
    fetch(request) {
      calls.push(new URL(request.url).pathname);
      return new Response('static asset', { status: 200 });
    },
  };
}

function env(assetBinding = assets()) {
  return {
    CREATOR_LINK_BACKEND_URL: endpoint,
    CREATOR_LINK_PROXY_TOKEN: token,
    ASSETS: assetBinding,
  };
}

test('proxies a valid creator ID to the backend and redirects without caching', async () => {
  const calls = [];
  const response = await handleRequest(
    new Request('https://vwake.app/sabina?utm_source=post', {
      headers: { 'user-agent': 'Mozilla/5.0 (iPhone)' },
    }),
    env(),
    async (url, options) => {
      calls.push({ url: new URL(url), options });
      return new Response(null, {
        status: 302,
        headers: { Location: 'https://apps.apple.com/app/id6762626732' },
      });
    },
  );
  assert.equal(response.status, 302);
  assert.equal(response.headers.get('Location'), 'https://apps.apple.com/app/id6762626732');
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url.searchParams.get('slug'), 'sabina');
  assert.equal(calls[0].url.searchParams.has('utm_source'), false);
  assert.equal(calls[0].options.headers.get('X-Vwake-Link-Token'), token);
  assert.equal(calls[0].options.headers.get('User-Agent'), 'Mozilla/5.0 (iPhone)');
  assert.equal(calls[0].options.redirect, 'manual');
});

test('preserves static pages and rejects malformed creator paths', async () => {
  const assetBinding = assets();
  const binding = env(assetBinding);
  let backendCalls = 0;
  const backend = async () => {
    backendCalls += 1;
    throw new Error('backend must not be called');
  };
  for (const path of ['/', '/privacy.html', '/privacy', '/en/', '/en/privacy.html', '/robots.txt', '/assets/creator-marquee.css']) {
    const response = await handleRequest(new Request(`https://vwake.app${path}`), binding, backend);
    assert.equal(response.status, 200, path);
  }
  for (const path of ['/ALEX', '/a', '/alex/something', '/%252e%252e', '/-bad']) {
    const response = await handleRequest(new Request(`https://vwake.app${path}`), binding, backend);
    assert.equal(response.status, 404, path);
  }
  assert.equal(backendCalls, 0);
  assert.equal(assetBinding.calls.length, 7);
});

test('returns 404 for an unknown creator and does not leak the proxy token', async () => {
  const response = await handleRequest(
    new Request('https://vwake.app/nobody'),
    env(),
    async () => new Response('internal detail', { status: 404, headers: { 'X-Vwake-Link-Token': token } }),
  );
  assert.equal(response.status, 404);
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  assert.equal(response.headers.get('X-Vwake-Link-Token'), null);
  assert.equal(await response.text(), 'Creator not found');
});

test('backend outage falls back to a fixed platform destination', async () => {
  const cases = [
    ['Mozilla/5.0 (iPhone)', 'https://apps.apple.com/app/id6762626732'],
    ['Mozilla/5.0 (Linux; Android 15)', 'https://play.google.com/store/apps/details?id=com.vwake.vwake'],
    ['Mozilla/5.0 (Macintosh)', 'https://vwake.app/'],
  ];
  for (const [userAgent, expected] of cases) {
    const response = await handleRequest(
      new Request('https://vwake.app/sabina', { headers: { 'user-agent': userAgent } }),
      env(),
      async () => { throw new Error('connection failed'); },
    );
    assert.equal(response.status, 302);
    assert.equal(response.headers.get('Location'), expected);
    assert.equal(response.headers.get('Cache-Control'), 'no-store');
  }
});

test('rejects an unexpected backend redirect target', async () => {
  const response = await handleRequest(
    new Request('https://vwake.app/sabina', { headers: { 'user-agent': 'Android' } }),
    env(),
    async () => new Response(null, { status: 302, headers: { Location: 'https://attacker.example/' } }),
  );
  assert.equal(response.headers.get('Location'), 'https://play.google.com/store/apps/details?id=com.vwake.vwake');
});

test('only GET and HEAD reach the backend for creator paths', async () => {
  let backendCalls = 0;
  const response = await handleRequest(
    new Request('https://vwake.app/sabina', { method: 'POST' }),
    env(),
    async () => { backendCalls += 1; return new Response(null, { status: 302 }); },
  );
  assert.equal(response.status, 405);
  assert.equal(response.headers.get('Allow'), 'GET, HEAD');
  assert.equal(backendCalls, 0);
});

test('Cloudflare configuration keeps the Worker source private', async () => {
  const configuration = JSON.parse(await readFile(new URL('../wrangler.jsonc', import.meta.url), 'utf8'));
  const ignoredAssets = await readFile(new URL('../.assetsignore', import.meta.url), 'utf8');
  assert.equal(configuration.main, 'src/creator-link-worker.mjs');
  assert.equal(configuration.assets.binding, 'ASSETS');
  assert.ok(ignoredAssets.split('\n').includes('src'));
});
