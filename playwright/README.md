# Toolbox browser tests

From the project root, install the locked dependencies and Chromium, then run the suite:

```sh
npm ci
npx playwright install chromium
npm test
```

Playwright starts its own Toolbox server on port 3195. Use `npm test -- --project=desktop` or `npm test -- --project=mobile` to run one project. Add new browser tests as `*.spec.js` files in this folder. Mobile-specific tests go in `mobile.spec.js`.

To use a Toolbox server you already started on port 3195, set `PLAYWRIGHT_REUSE_SERVER=1` before running the tests.
