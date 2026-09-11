# mimifuwa.cc

個人ブログと記事管理画面を含む monorepo です。

## アプリケーション

- `apps/web`: Astro で構築したブログ本体。記事や静的コンテンツを中心に、必要な箇所だけ React island を使います。
- `apps/admin`: TanStack Start / TanStack Router / React で構築する記事管理画面。URL と route tree を中心に、loader と server function で API に接続します。
- `apps/api`: Cloudflare Workers + Hono の API。
- `packages/parser`: Markdown と記事メタデータの解析。
- `packages/blog-ui`: 記事本文・リンクカード・Twitter カードの表示契約、共通 CSS、表示用の純粋関数。
- `packages/ui`: ブログと管理画面で共有する UI コンポーネント。

ブログと管理画面ではフレームワークを統一しません。Document first のブログには Astro、Application first の管理画面には TanStack Start を使い、Domain / Effect / UI の境界を共有します。

## 開発

```bash
vp install
vp run dev
```

個別に起動する場合は `vp run -F @mimifuwacc/admin dev` など、対象パッケージのスクリプトを実行してください。

## 確認

```bash
vp check
vp test
vp run -r build
```

Astro ファイルは Prettier、TypeScript / TSX ファイルは Vite+ の Oxfmt を使います。

## デプロイ

本番ブランチは `release`、開発ブランチは `dev` です。Cloudflare Workers の開発環境には `dev`、本番環境には `production` の Wrangler 設定を使います。

管理画面は TanStack Start の Cloudflare Workers 出力を `wrangler deploy` で公開します。秘密鍵は `DOTENV_PRIVATE_KEY` と `DOTENV_PRIVATE_KEY_DEV` で管理します。

本番の公開ページと記事 API は Cloudflare Workers Cache に入り、記事の作成・更新・削除・非公開化時に対象 URL を purge します。デプロイ前に、Cache Purge 権限だけを持つ Cloudflare API token を `CACHE_PURGE_API_TOKEN` として `env/.env.production` に登録してください。デプロイ時に zone ID は自動取得され、Worker secret として設定されます。
