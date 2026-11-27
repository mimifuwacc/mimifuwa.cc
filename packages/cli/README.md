# @mimifuwacc/cli

Vite plugin and CLI for processing and publishing Mimifuwacc's Ox Content articles.

## Vite configuration

Install `@mimifuwacc/cli` and `@ox-content/vite-plugin` as development dependencies, then configure the content source in `vite.config.ts`:

Install the latest CLI source from this repository with pnpm:

```sh
pnpm add -D 'github:mimifuwacc/mimifuwa.cc#main&path:/packages/cli'
```

The lockfile records the resolved commit from `main`; run `pnpm update @mimifuwacc/cli` to move to a newer commit. The repository is public, so this works locally and in GitHub Actions without registry credentials.

```ts
import { mimifuwaccContent } from "@mimifuwacc/cli/vite";

export default defineConfig({
  plugins: [
    mimifuwaccContent({
      target: { url: "https://example.com" },
      srcDir: "./articles",
      collections: {
        posts: { source: "posts/**/*", include: ["html"] },
        works: { source: "works/**/*", include: ["html"] },
      },
    }),
  ],
});
```

The plugin defines the Markdown source and collections. Structured site data such as the profile, Links, and On Repeat entries lives in `data/site-content.json` and is compiled into the site during SSG.

## Local development and build

Run the CLI from a content repository that has `articles/posts/` and `articles/works/`:

```sh
mimifuwacc dev
mimifuwacc build
```

`dev` starts the CLI's bundled preview site and reads Markdown from the current repository. Saving a Markdown file reloads the article data and refreshes the page. Open an article and use its **OG image preview** link, or visit `/__og/posts/<slug>.html` or `/__og/works/<slug>.html` directly to inspect the OG HTML locally. Local preview needs no Cloudflare credentials. `build` writes a static site and its article OG PNGs to `dist/`; set `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` to render images with Browser Run. Set `OG_IMAGE_CACHE_DIR` to reuse unchanged screenshots between builds. `preview` remains an alias for `dev`.

The `mimifuwa.cc` Vite development server also watches its configured `CONTENT_DIR`; Markdown changes trigger a browser reload there as well. It serves the same OG HTML preview under `/__og/posts/<slug>.html` and `/__og/works/<slug>.html`.

## Publish content

Deploy the site first so its resolved `STORAGE` bucket configuration is available. Then run from the site workspace, setting `CONTENT_DIR` to the desired articles directory:

```sh
CONTENT_DIR=packages/content-dev/articles vp exec --filter @mimifuwacc/cli -- mimifuwacc deploy
```

The CLI loads Ox Content to collect embedded media and remote Open Graph image URLs, uploads those assets and an image allowlist under a revision key with Cloudflare's `cf` CLI, then updates the active revision in R2. It does not upload article JSON or site data because those are compiled into static pages. It does not deploy the website. In this workspace, `cf` is installed with the other dependencies through Vite+. `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` must be available in the environment; the token needs permission to write R2 objects.

The `mimifuwa.cc` repository deploys a preview from `main`. A version tag creates a GitHub Release; it does not deploy the site or publish the CLI to a package registry. Merging content into `mimifuwa.cc-content`'s `main` calls the reusable deployment workflow in `mimifuwa.cc`, which publishes the content and rebuilds and deploys production using the latest stable site release.
