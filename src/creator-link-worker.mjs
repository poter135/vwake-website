const APP_STORE_URL = 'https://apps.apple.com/app/id6762626732';
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.vwake.vwake';
const WEBSITE_URL = 'https://vwake.app/';
const ALLOWED_DESTINATIONS = new Set([APP_STORE_URL, PLAY_STORE_URL, WEBSITE_URL]);

// Keep these website namespaces out of creator IDs. Static files take priority in
// Cloudflare's asset routing; these entries also protect extensionless page URLs.
const RESERVED_PATHS = new Set([
  'assets', 'en', 'eula', 'eula.html', 'index', 'index.html', 'ja',
  'new icon', 'privacy', 'privacy.html', 'robots', 'robots.txt',
  'sitemap', 'sitemap.xml', 'store_preview', 'terms', 'terms.html',
]);
const STATIC_PREFIXES = ['/assets/', '/en/', '/ja/', '/new%20icon/', '/store_preview/', '/.well-known/'];

function fallbackDestination(userAgent) {
  if (/android/i.test(userAgent)) return PLAY_STORE_URL;
  if (/iphone|ipad|ipod/i.test(userAgent)) return APP_STORE_URL;
  return WEBSITE_URL;
}

function redirect(destination) {
  return new Response(null, {
    status: 302,
    headers: {
      Location: destination,
      'Cache-Control': 'no-store',
      'Referrer-Policy': 'no-referrer',
    },
  });
}

function notFound(method) {
  return new Response(method === 'HEAD' ? null : 'Creator not found', {
    status: 404,
    headers: {
      'Cache-Control': 'no-store',
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}

export async function handleRequest(request, env, fetchImpl = fetch) {
  const url = new URL(request.url);
  const path = url.pathname;
  const barePath = path.slice(1).replace(/\/$/, '');

  if (path === '/' || RESERVED_PATHS.has(barePath) || STATIC_PREFIXES.some((prefix) => path.startsWith(prefix))) {
    return env.ASSETS.fetch(request);
  }

  if (!/^\/[a-z0-9_]{2,30}\/?$/.test(path)) {
    return notFound(request.method);
  }

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response(null, {
      status: 405,
      headers: { Allow: 'GET, HEAD', 'Cache-Control': 'no-store' },
    });
  }

  const fallback = fallbackDestination(request.headers.get('User-Agent') || '');
  if (!env.CREATOR_LINK_BACKEND_URL || !env.CREATOR_LINK_PROXY_TOKEN) {
    console.error('Creator link backend configuration is missing');
    return redirect(fallback);
  }

  let backendUrl;
  try {
    backendUrl = new URL(env.CREATOR_LINK_BACKEND_URL);
    if (backendUrl.protocol !== 'https:') throw new Error('HTTPS required');
    backendUrl.searchParams.set('slug', barePath);
  } catch {
    console.error('Creator link backend URL is invalid');
    return redirect(fallback);
  }

  try {
    const backendResponse = await fetchImpl(backendUrl.toString(), {
      method: request.method,
      headers: new Headers({
        'X-Vwake-Link-Token': env.CREATOR_LINK_PROXY_TOKEN,
        'User-Agent': request.headers.get('User-Agent') || '',
      }),
      redirect: 'manual',
      signal: AbortSignal.timeout(3000),
    });

    if (backendResponse.status === 404) return notFound(request.method);
    if (backendResponse.status === 302) {
      const location = backendResponse.headers.get('Location');
      if (ALLOWED_DESTINATIONS.has(location)) return redirect(location);
      console.error('Creator link backend returned an unexpected destination');
    } else {
      console.error(`Creator link backend returned status ${backendResponse.status}`);
    }
  } catch {
    console.error('Creator link backend is unavailable');
  }

  return redirect(fallback);
}

export default {
  fetch: handleRequest,
};
