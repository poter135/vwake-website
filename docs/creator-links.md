# Creator links on vwake.app

The Worker serves existing static assets first. A single lowercase creator ID path,
such as `/sabina`, is sent to the Vwake Firebase creator-link backend. The backend
checks whether the creator exists, counts the click, and returns a store or homepage
redirect. The Worker accepts only the known App Store, Google Play, or homepage URL
as a redirect target. Unknown creators receive `404`.

## Runtime configuration

Set these on the `vwake-website` Cloudflare Worker before deploying the route:

- `CREATOR_LINK_BACKEND_URL`: the full HTTPS URL of the deployed Firebase redirect
  endpoint. The Worker adds the validated `slug` query parameter.
- `CREATOR_LINK_PROXY_TOKEN`: a Cloudflare secret matching the Firebase backend's
  proxy token. Never put it in `wrangler.jsonc` or a public asset.

Deploy the Firebase endpoint and configure both values before publishing the
website change. If the backend is unavailable, the Worker sends mobile visitors
to the fixed store URL and desktop visitors to the homepage. Those fallback clicks
cannot be counted by Firebase. The Worker does not log the token or user agent.

This first version does not configure iOS Universal Links or Android App Links.
Installed-app visitors follow the same website redirect to the store; the store
may show an Open button. Direct in-app referral entry is deferred.

Run local tests with `node --test tests/*.test.mjs`. After deployment, check the
known and unknown creator URLs on iPhone, Android, and desktop, plus the click
counter and existing static pages.
