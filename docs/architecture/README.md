# Site architecture

`apps/web` is the site's only application. Void generates page HTML from Ox Content during deployment and deploys the static pages with two asset routes as a Cloudflare Worker. Those routes serve embedded content assets and allowlisted Open Graph images from the active R2 revision; article and site data is static.

The source for articles and work entries lives in `mimifuwa.cc-content`. `packages/content-preview/articles` contains a small fixture set for local development. Profile details and mutual links that are specific to this site live in `contents/`.

The `mimifuwacc` CLI in `packages/cli` starts the Vue development server or builds the site with a selected content directory. See [the CLI guide](../../packages/cli/README.md).
