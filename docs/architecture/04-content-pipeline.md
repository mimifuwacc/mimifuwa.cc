# Content pipeline

The source of truth for blog posts and work entries is the `mimifuwa.cc-content` repository. It stores Markdown under `articles/blogs` and `articles/works`.

## Local preview

The content repository runs the `mimifuwacc` CLI from this repository. The CLI passes its selected article directory to the Vue app through `CONTENT_DIR`; the Ox Content Vite plugin loads the blogs and works collections from that directory.

```sh
mimifuwacc preview --content articles
```

When developing the site itself, the app uses a few fixtures from `packages/content-dev/articles`:

```sh
vp run dev
```

## Build and publish

The local CLI can build the Vue Worker with the selected collections bundled in dev content mode. This is for checking content and does not publish it. In production, Void API routes read the active revision from the `STORAGE` R2 bucket. They expose blog and work indexes, article details, search data, and the content publish endpoints. The content repository produces and uploads the revision files.

The content publisher uploads a complete revision before switching the active revision pointer. The site reads only the active revision, so an incomplete upload is not shown to visitors.

## Deployment

- A push to `dev` deploys the `mimifuwa-cc-dev` Worker. Its blog and work API responses are bundled from `packages/content-dev`; it does not read or publish content in R2.
- A push to `release` deploys the production Worker. Its blog and work API responses use the active revision published by `mimifuwa.cc-content` in R2.
- `CONTENT_PUBLISH_TOKEN` is configured only on the production Worker. The dev Worker returns `404` from content publishing endpoints.
