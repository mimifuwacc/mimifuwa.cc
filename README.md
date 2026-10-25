# mimifuwa.cc

Vue で構築した個人サイトです。Void を使って Cloudflare Workers にデプロイし、記事と Works の本文は `mimifuwa.cc-content` から R2 に公開します。

## 開発

Node.js 24.21 以降を用意して、依存関係をインストールします。

```sh
vp install
vp run dev
```

ローカルでは `packages/content-dev/articles` のサンプル記事を使います。別の Markdown ディレクトリを確認するときは `CONTENT_DIR` を指定できます。

```sh
CONTENT_DIR=/path/to/articles vp run dev
```

`mimifuwa.cc-content` の CLI から起動する場合は `mimifuwacc preview --content articles` を使います。詳細は [content preview](./packages/cli/README.md) を参照してください。

## 確認

```sh
vp check
vp run -r build
```

## デプロイ

- `dev` への push は開発環境へ自動デプロイします。
- `release` への push は本番環境へ自動デプロイし、GitHub Release を作成します。
- Cloudflare の認証情報と `VOID_CONTENT_PUBLISH_TOKEN` は GitHub Actions の `dev` / `production` 環境シークレットで管理します。
