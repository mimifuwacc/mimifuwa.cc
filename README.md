# mimifuwa.cc

個人サイトと記事 renderer を含む monorepo です。

## アプリケーション

- `apps/web`: React + Vite で静的 HTML を生成するサイト本体。
- `packages/cli`: private content repository を preview / check / SSG build する `@mimifuwacc/cli` (`mimifuwacc`)。
- 記事は private repository `mimifuwacc/mimifuwa.cc-content` から CI で checkout して静的生成します。
- `packages/parser`: Markdown と記事メタデータの解析。
- `packages/blog-ui`: 記事本文・リンクカード・Twitter カードの表示契約と共通 CSS。

公開サイトは build-time に Markdown を HTML へ変換する SSG です。記事の編集や未公開記事の preview は private content repository と `mimifuwacc` CLI で行います。

## 開発

```bash
vp install
vp run dev
```

記事をローカルで preview する場合は、content repository のルートを指定して `mimifuwacc preview` を実行します。

## 確認

```bash
vp check
vp test
vp run -r build
```

Formatter と linter は Vite+ (`vp fmt` / `vp lint`) に統一しています。

## デプロイ

本番ブランチは `release`、開発ブランチは `dev` です。Cloudflare Workers の開発環境には `dev`、本番環境には `production` の Wrangler 設定を使います。

Web は Cloudflare Workers Static Assets として `dist` を `wrangler deploy` します。CI は read-only の `CONTENT_REPOSITORY_TOKEN` で private content repository を一時 checkout します。
