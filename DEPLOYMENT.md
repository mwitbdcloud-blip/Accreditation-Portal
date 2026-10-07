# Netlify deployment

Netlify publishes the Vite frontend from `dist` using `npm run build:client`.
The existing `npm run build` command remains available for full-stack builds,
but must not be used for this static deployment: it also places a backend
bundle and its source map in `dist`, where they would be publicly accessible.

Requests to `/api/*` continue to be proxied to the existing Cloud Run backend.
Keep private API credentials, including `GEMINI_API_KEY`, on that backend.
Remove `GEMINI_API_KEY` from the Netlify site's environment settings if it is
still configured there; the frontend does not require it. Do not add secrets
to `VITE_*` variables, Vite's `define` configuration, or files under `public`.

Secrets scanning remains enabled, with no exemptions. If a new deployment
still fails, use the scanner's reported file paths to identify the remaining
match rather than assuming that the list of configured environment variables
identifies the offending value. Firebase browser configuration is separate
from the server-only Gemini credential.

If a private key appeared in an earlier published bundle or was committed to
the repository, revoke and replace it in the backend's secret settings.
