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

The production site builds its page HTML directly from the Ox Content collections during SSG. The content CLI also publishes a complete revision to the `STORAGE` R2 bucket, then switches the active revision pointer after all files are uploaded. API routes read only the active revision, so an incomplete upload is not shown to visitors.

## Deployment

- A push to `main` deploys the `mimifuwa-cc-dev` Worker and publishes `packages/content-dev/articles` to its R2 bucket.
- A version prerelease tag such as `v5.0.0-dev.0` or `v5.0.0-alpha.0` publishes the CLI under its prerelease npm tag, deploys the dev Worker, and publishes `packages/content-dev/articles`.
- A stable version tag such as `v5.0.0` publishes the CLI under npm's `latest` tag and deploys production with the `mimifuwa.cc-content` `main` branch as its SSG source.
- Every merge to `mimifuwa.cc-content` `main` publishes its content revision to R2, then checks out the latest stable site release and rebuilds and deploys production using the merged Markdown and JSON files.
