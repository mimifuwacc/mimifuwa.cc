# web-vue

Vue Router provides the interactive shell, while Ox Content owns Markdown processing, static article pages, and the full-text search index. The generated `dist/` is deployed as a static site through Void.

```sh
vp run dev:vue
vp run --filter @mimifuwacc/web-vue build
vp run --filter @mimifuwacc/web-vue deploy
```

Void deployment requires Node.js 24.21 or newer. Configure a target with `void connect` before deploying; the saved target can be a Void platform or your Cloudflare account.
