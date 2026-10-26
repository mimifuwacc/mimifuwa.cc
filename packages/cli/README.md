# mimifuwacc content CLI

The `mimifuwacc` command previews or builds the Vue site using the content repository's Markdown. The Vue app processes `articles/blogs` and `articles/works` with the Ox Content Vite plugin, then serves the site's own styled pages and API responses.

## Preview

From the content repository, run:

```sh
mimifuwacc preview --content articles
```

This starts the Vue development server and points Ox Content at `articles`. The default site location is `../mimifuwa.cc/apps/web-vue`; if the repositories are elsewhere, provide `--site` or set `MIMIFUWA_SITE_DIR` to the `apps/web-vue` directory.

For local development inside this repository, use the included fixtures:

```sh
vp run dev
```

## Build

```sh
mimifuwacc build --content articles
```

The build command writes the Worker build under the Vue app's `dist` directory, bundling the selected content collection for local inspection. Both commands use the `dev` content mode: they never read from or publish to production R2. Production articles continue to be read from the active R2 revision after the content repository publishes them.

Run `mimifuwacc --help` to print the available command syntax.
