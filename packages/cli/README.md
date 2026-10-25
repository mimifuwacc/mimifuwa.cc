# mimifuwacc content CLI

The `mimifuwa` command previews or builds a content directory with the Vue site in this repository.

## Preview

From the content repository, run:

```sh
mimifuwacc preview --content articles
```

This starts the Vue development server and points `CONTENT_DIR` at `articles`. The default site location is `../mimifuwa.cc/apps/web-vue`; if the repositories are elsewhere, provide `--site` or set `MIMIFUWA_SITE_DIR` to the `apps/web-vue` directory.

For local development inside this repository, use the included fixtures:

```sh
vp run dev
```

## Build

```sh
mimifuwacc build --content articles
```

The build command writes the site output under the Vue app's `dist` directory.
