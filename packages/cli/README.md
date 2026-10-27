# @mimifuwacc/cli

Vite plugin and CLI for processing and publishing Mimifuwacc's Ox Content articles.

## Vite configuration

Install `@mimifuwacc/cli` and `@ox-content/vite-plugin` as development dependencies, then configure the content source and its single publish target in `vite.config.ts`:

```ts
import { mimifuwaccContent } from "@mimifuwacc/cli/vite";

export default defineConfig({
  plugins: [
    mimifuwaccContent({
      srcDir: "./articles",
      collections: {
        blogs: { source: "blogs/**/*", include: ["html"] },
        works: { source: "works/**/*", include: ["html"] },
      },
      target: {
        url: process.env.CONTENT_PUBLISH_URL!,
        token: process.env.CONTENT_PUBLISH_TOKEN,
      },
    }),
  ],
});
```

`target.token` is only read by the deploy command. Keep it in the CI environment or a local untracked environment file; never commit the token.

## Local preview

In the site repository, `vp run dev` serves the sample articles in `packages/content-dev/articles`. It does not contact the publish target.

## Publish content

Run from the repository whose `vite.config.ts` defines the desired articles and target:

```sh
vp exec @mimifuwacc/cli deploy
```

The CLI builds with Vite, reads the configured Ox Content collections, writes the publish JSON payload, uploads a new revision, and activates it only after all required files are present. The target URL and token come from the Vite configuration and its environment; there is no separate `--target` option.

For the website repository, configure `packages/content-dev/articles` and the dev Worker target. For `mimifuwa.cc-content`, configure `articles` and the production target. The two repositories use the same command while retaining separate content and credentials.

## npm releases

The `Publish CLI` workflow publishes tags named `cli-v<version>` (for example, `cli-v0.1.0`). Keep the tag version aligned with this package's `version`. Configure npm Trusted Publishing for this repository and `.github/workflows/publish-cli.yml`; the workflow publishes with OIDC and does not require a long-lived npm token.
