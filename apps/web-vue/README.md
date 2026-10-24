# web-vue

Vue Router provides the interactive shell. Ox Content builds article pages and the full-text search index. A Void Worker serves the site and reads published article files from its environment-specific R2 bucket.

```sh
vp run dev:vue
vp run --filter @mimifuwacc/web-vue build
vp run --filter @mimifuwacc/web-vue deploy
```

Set `MIMIFUWA_CC_DEPLOY_ENV=dev` to deploy the dev Worker and bucket. Leave it unset or set it to `release` for production. Local preview uses the local Vite/Void development server and does not select a remote deployment environment.
