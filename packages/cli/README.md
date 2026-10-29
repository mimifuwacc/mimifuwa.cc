# @mimifuwacc/cli

Vite plugin and CLI for processing and publishing Mimifuwacc's Ox Content articles.

## Vite configuration

Install `@mimifuwacc/cli` and `@ox-content/vite-plugin` as development dependencies, then configure the content source in `vite.config.ts`:

```ts
import { mimifuwaccContent } from "@mimifuwacc/cli/vite";

export default defineConfig({
  plugins: [
    mimifuwaccContent({
      target: { url: "https://example.com" },
      srcDir: "./articles",
      dataDir: "./data",
      collections: {
        blogs: { source: "blogs/**/*", include: ["html"] },
        works: { source: "works/**/*", include: ["html"] },
      },
    }),
  ],
});
```

The plugin defines the Markdown source and collections. Structured site data such as the profile, Mutuals, and On Repeat entries lives in `data/site-content.json`; the CLI publishes it alongside the generated article content to the `STORAGE` R2 bucket configured by the site deployment.

## Local preview

In the site repository, `vp run dev` serves the sample articles and `packages/content-dev/data/site-content.json`. It does not contact the publish target.

## Publish content

Deploy the site first so its resolved `STORAGE` bucket configuration is available. Then run from the site workspace, setting `CONTENT_DIR` to the desired articles directory:

```sh
CONTENT_DIR=packages/content-dev/articles vp exec --filter @mimifuwacc/cli -- mimifuwacc deploy
```

The CLI loads only the Ox Content plugin, builds the collection payload, uploads it under a revision key with Cloudflare's `cf` CLI, and updates the active revision in R2. It does not build or deploy the website. In this workspace, `cf` is installed with the other dependencies through Vite+. `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` must be available in the environment; the token needs permission to write R2 objects.

The `main` branch workflow publishes `packages/content-dev/articles` and `packages/content-dev/data/site-content.json` to the dev Worker. A version prerelease tag such as `v5.0.0-dev.0` or `v5.0.0-alpha.0` publishes the site and the same dev content. A stable version tag such as `v5.0.0` publishes the site and the articles and structured data from `mimifuwa.cc-content`'s `main` branch.

## npm releases

The release workflow publishes tags named `v<version>` (for example, `v5.0.0`, `v5.0.0-dev.0`, or `v5.0.0-alpha.0`). It takes the package version from the tag and sets that version in the publish job's package manifest. Stable releases use npm's `latest` dist-tag; prereleases use the first prerelease identifier as the dist-tag (`dev`, `alpha`, and so on). The same workflow then deploys the site and publishes content with that exact CLI version. Configure npm Trusted Publishing for this repository and `.github/workflows/deploy.yml`; publishing uses OIDC and does not require a long-lived npm token.
