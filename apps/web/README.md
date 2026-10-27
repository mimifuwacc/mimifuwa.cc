# web

Vue Router provides the shared site layout, blog index and article pages, works list and detail pages, and links page. Void API routes read the active Ox Content revision from R2 and provide the blog list, work list and details, and search index to the client. The content publisher uploads each revision to R2 and switches the active revision only after all files are present.

Local development uses `packages/content-dev/articles` and serves the articles directly from the Vite dev server. The same articles are published to the dev Worker after a push to `dev`. Production articles are published separately from the `mimifuwa.cc-content` repository.

GitHub Actions deploys the `mimifuwa-cc-dev` Worker and publishes `packages/content-dev/articles` when `dev` is updated. Dev and production use separate Worker storage and publish tokens. The dev Worker URL is `https://mimifuwa-cc-dev.m8c.workers.dev`.

Configure the `dev` and `production` GitHub Actions environments with these secrets:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`
- `CONTENT_PUBLISH_TOKEN` in `dev`
- `VOID_CONTENT_PUBLISH_TOKEN` in `production`

Each deployment workflow writes its environment's token to that Void Worker as `CONTENT_PUBLISH_TOKEN`. The production token must also be configured in the `mimifuwa.cc-content` repository for publishing.

```sh
vp run dev
vp run --filter @mimifuwacc/web build
vp run --filter @mimifuwacc/web deploy
```

Void deployment requires Node.js 24.21 or newer. Configure a target with `void connect` before deploying; the saved target can be a Void platform or your Cloudflare account.
