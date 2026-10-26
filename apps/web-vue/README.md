# web-vue

Vue Router provides the shared site layout, blog index and article pages, works list and detail pages, and links page. Void API routes read the active Ox Content revision from R2 and provide the blog list, work list and details, and search index to the client. The content publisher uploads each revision to R2 and switches the active revision only after all files are present.

Local development uses the small fixture set in `packages/content-dev/articles`. The `mimifuwa.cc-content` CLI passes its article directory through `CONTENT_DIR`, so the site preview processes those Markdown files with the same Ox Content collections. The CLI build is a local content build only; production content is still published as a revision to R2 by the content repository.

GitHub Actions deploys the `mimifuwa-cc-dev` Worker when `dev` is updated and production when `release` is updated. The dev Worker serves the fixtures bundled from `packages/content-dev`, so it does not need an R2 publish token and cannot modify production content. Its public URL is `https://mimifuwa-cc-dev.m8c.workers.dev`.

Configure the `dev` and `production` GitHub Actions environments with these secrets:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`
- `VOID_CONTENT_PUBLISH_TOKEN` (production only)

The deployment workflow writes `VOID_CONTENT_PUBLISH_TOKEN` to the Void Worker as `CONTENT_PUBLISH_TOKEN`. The matching token must also be configured in the `mimifuwa.cc-content` repository for publishing.

```sh
vp run dev
vp run --filter @mimifuwacc/web-vue build
vp run --filter @mimifuwacc/web-vue deploy
```

Void deployment requires Node.js 24.21 or newer. Configure a target with `void connect` before deploying; the saved target can be a Void platform or your Cloudflare account.
