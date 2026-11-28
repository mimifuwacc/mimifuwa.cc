# Content pipeline

The source of truth for posts and work entries is the `mimifuwa.cc-content` repository. It stores Markdown under `articles/posts` and `articles/works`.

## Local preview

The content repository runs the `mimifuwacc` CLI from this repository. The CLI passes its selected article directory to the Vue app through `CONTENT_DIR`; the Ox Content Vite plugin loads the posts and works collections from that directory.

```sh
mimifuwacc dev --content articles
```

When developing the site itself, the app uses a few fixtures from `packages/content-preview/articles`:

```sh
vp run dev
```

## Build and publish

The production site builds its page HTML directly from the Ox Content collections during SSG. The content CLI publishes embedded media and the allowlist for remote Open Graph images to the `STORAGE` R2 bucket, then switches the active revision pointer after the files are uploaded. Asset routes read only the active revision, so an incomplete upload is not shown to visitors. Article and site data is compiled into the static pages and is not fetched through runtime JSON APIs.

## Deployment

- A push to `main` deploys the Worker configured by the `preview` GitHub environment and publishes `packages/content-preview/articles` to its R2 bucket.
- A version prerelease tag such as `v5.0.0-dev.0` or `v5.0.0-alpha.0` publishes the CLI under its prerelease GitHub Packages tag, deploys the preview Worker, and publishes `packages/content-preview/articles`.
- A stable version tag such as `v5.0.0` publishes the CLI under GitHub Packages' `latest` tag and deploys production with the `mimifuwa.cc-content` `main` branch as its SSG source.
- Every merge to `mimifuwa.cc-content` `main` publishes its content revision to R2, then checks out the latest stable site release and rebuilds and deploys production using the merged Markdown and JSON files.
