# web-vue

Vue Router provides the shared site layout, blog index and article pages, works list and detail pages, and links page. Void API routes read the active Ox Content revision from R2 and provide the blog list, work list and details, and search index to the client. The content publisher uploads each revision to R2 and switches the active revision only after all files are present.

Local development uses the small fixture set in `packages/content-dev/articles`. The `mimifuwa.cc-content` CLI passes its own article directory through `CONTENT_DIR`, so content preview and publishing run the same Ox Content pipeline against the real articles.

Set `CONTENT_PUBLISH_TOKEN` as a Void secret in each deployment environment. The matching GitHub Actions secret is used by `mimifuwa.cc-content` when publishing.

```sh
vp run dev:vue
vp run --filter @mimifuwacc/web-vue build
vp run --filter @mimifuwacc/web-vue deploy
```

Void deployment requires Node.js 24.21 or newer. Configure a target with `void connect` before deploying; the saved target can be a Void platform or your Cloudflare account.
