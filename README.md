# mimifuwa.cc

A personal website built with Vue and deployed to Cloudflare Workers using Void.
Ox Content converts the blog and Works content to HTML at build time. Whenever
the `main` branch of `mimifuwa.cc-content` is updated, the production site is
rebuilt as a static site and redeployed. R2 serves content data and images used
by the API.

## Development

Install Node.js 24.21 or later, then install the dependencies:

```sh
vp install
vp run dev
```

Local development uses sample articles from `packages/content-preview/articles`.
To use a different directory of Markdown files, set `CONTENT_DIR`:

```sh
CONTENT_DIR=/path/to/articles vp run dev
```

To start the site from the `mimifuwa.cc-content` CLI, run
`mimifuwacc dev --content articles`. See [content development](./packages/cli/README.md)
for details.

## Checks

```sh
vp check
vp run -r build
```

## Deployment

- Pushes to `main` are automatically deployed to <https://preview.mimifuwa.cc>.
  Posts and Works use sample content from `packages/content-preview`.
- A `vX.Y.Z` tag publishes the CLI to GitHub Packages with the `latest` tag,
  deploys the production site as a static site using `main` from
  `mimifuwa.cc-content`, and then creates a GitHub Release. Merges to the content
  repository's `main` also redeploy the production site after publishing content
  to R2.
- A `vX.Y.Z-dev.N` or `vX.Y.Z-alpha.N` tag publishes the CLI to GitHub Packages
  with the matching prerelease tag, then deploys the preview Worker with sample
  articles from `packages/content-preview`.
- Cloudflare API tokens are stored as GitHub Actions environment secrets.
  Account IDs and Worker names are configured as environment variables. The
  preview environment is managed by this repository's Terraform configuration.

Create release tags from the latest `main` using the task that prompts for
confirmation:

```sh
vp run release -- v5.0.1
```

The task shows the target commit and deployment contents before tagging. It
creates and pushes a signed tag only if you confirm with `yes`. To review the
release without creating a tag, run `vp run release -- v5.0.1 --dry-run`.
