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

- `main` への push は <https://mimifuwa-cc-dev.m8c.workers.dev> へ自動デプロイします。Blogs と Works は `packages/content-dev` のサンプルを表示します。
- `vX.Y.Z` tag は CLI を npm の `latest` として公開し、本番サイトをデプロイした後、GitHub Release を作成します。content リポジトリの `main` へのマージで本番コンテンツを公開します。
- `vX.Y.Z-dev.N` や `vX.Y.Z-alpha.N` tag は CLI を対応する npm prerelease tag で公開し、dev Worker と `packages/content-dev` の記事をデプロイします。
- Cloudflare の認証情報は GitHub Actions の `dev` / `production` 環境シークレットで管理します。

リリースタグは最新の `main` に対して、確認プロンプト付きのタスクから作成します。

```sh
vp run release -- v5.0.1
```

タグ付け前に対象コミットとデプロイ内容を表示し、`yes` を選んだ場合だけ署名付きタグを作って push します。事前確認には `vp run release -- v5.0.1 --dry-run` を使えます。
