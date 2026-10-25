# Content pipeline

The source of truth for blog posts and work entries is the `mimifuwa.cc-content` repository. It stores Markdown under `articles/blogs` and `articles/works`.

## Local preview

The content repository runs the `mimifuwacc` CLI from this repository. The CLI passes its selected article directory to the Vue app through `CONTENT_DIR`.

```sh
mimifuwacc preview --content articles
```

When developing the site itself, the app uses a few fixtures from `packages/content-dev/articles`:

```sh
vp run dev
```

## Build and publish

The Vue app uses the Ox Content Markdown processor to create article pages and JSON indexes during the build. Its Void API routes read the active revision from the `STORAGE` R2 bucket. They expose blog and work indexes, article details, search data, and the content publish endpoints.

The content publisher uploads a complete revision before switching the active revision pointer. The site reads only the active revision, so an incomplete upload is not shown to visitors.

## Deployment

- A push to `dev` deploys the development Worker and uses `mimifuwa-cc-content-dev`.
- A push to `release` deploys the production Worker and uses `mimifuwa-cc-content`.
- `CONTENT_PUBLISH_TOKEN` is stored as a Void Worker secret. GitHub Actions reads the matching `VOID_CONTENT_PUBLISH_TOKEN` environment secret and sets it during deployment.
