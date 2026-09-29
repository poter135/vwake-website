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

The iOS Universal Links association file is at
`/.well-known/apple-app-site-association`. The linked iOS app needs the matching
`applinks:vwake.app` entitlement and in-app URL handling. Android App Links use
`/.well-known/assetlinks.json` with the **Google Play App Signing certificate**
SHA-256 fingerprint. This fingerprint was read from Play Console → Vwake →
Play App Signing → Digital Asset Links on 2026-09-29. Do not substitute an
upload-key fingerprint or AAB file digest. The Android app still needs a matching
verified intent filter and in-app URL handling.

Run local tests with `node --test tests/*.test.mjs`. After deployment, check the
association files return `200` with `application/json` and no redirects, then verify known and
unknown creator URLs on both platforms. App Link behavior needs a released app
build and a real device to validate.
