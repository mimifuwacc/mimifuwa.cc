# Site architecture

`apps/web` is the site's only application. Void serves the Vue app and its API routes as a Cloudflare Worker. The API routes read the active content revision from R2; `mimifuwa.cc-content` publishes revisions and controls which one is active.

The source for articles and work entries lives in `mimifuwa.cc-content`. `packages/content-dev/articles` contains a small fixture set for local development. Profile details and mutual links that are specific to this site live in `contents/`.

The `mimifuwacc` CLI in `packages/cli` starts the Vue development server or builds the site with a selected content directory. See [the CLI guide](../../packages/cli/README.md).
