# PhysicX website

The website uses the same backend and accounts as the PhysicX app. The combined server serves this folder at `/`, the application at `/app/`, and backend requests at `/api/`. Start it with the workspace instructions in the root README.

Account registration, email verification and resend, login, password reset, profile/license status, checkout, authenticated installer metadata, and contact submissions call the backend. Login shares `physicx_jwt` and `physicx_user_email` with the app. Sessions stay in the current browser tab by default; “Keep me signed in” uses local storage. Logout clears both stores.

`js/config.js` defaults to the current origin. For a separately hosted website, define `window.PHYSICX_CONFIG` before loading it with public `API_URL`, `APP_URL`, and optional `WEBSITE_BASE` values. Configure that origin in backend CORS. Never put provider secrets in website files.

Razorpay's public checkout key comes from the authenticated order response. A checkout callback does not mark an order paid: the status page asks `/payments/{order_id}` for the status recorded by the verified payment webhook. Backend email, payment, and installer configuration must be supplied before those integrations can succeed. Unconfigured services show actual backend errors.

Validate scripts with `node --test Website-PhysicX/tests/integration.test.cjs` from the workspace root. No static preview server is needed.
