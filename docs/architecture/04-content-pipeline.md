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

The site reads the active content revision from the `STORAGE` R2 bucket. The content CLI publishes a complete revision with the released `@mimifuwacc/cli`, then switches the active revision pointer after all files are uploaded. The site reads only the active revision, so an incomplete upload is not shown to visitors.

## Deployment

- A push to `main` deploys the `mimifuwa-cc-dev` Worker and publishes `packages/content-dev/articles` to its R2 bucket.
- A version prerelease tag such as `v5.0.0-dev.0` or `v5.0.0-alpha.0` publishes the CLI under its prerelease npm tag, deploys the dev Worker, and publishes `packages/content-dev/articles`.
- A stable version tag such as `v5.0.0` publishes the CLI under npm's `latest` tag and deploys production. After deployment, it dispatches and waits for the content repository's publish workflow to build and publish that repository's `main` branch.
