# mimifuwa.cc

Vue で構築した個人サイトです。Void を使って Cloudflare Workers にデプロイします。ブログと Works は Ox Content でビルド時に HTML 化し、`mimifuwa.cc-content` の main が更新されるたびに本番サイトを SSG で再デプロイします。R2 は API から使うコンテンツデータと画像の配信に使います。

## 開発

Node.js 24.21 以降を用意して、依存関係をインストールします。

```sh
vp install
vp run dev
```

ローカルでは `packages/content-preview/articles` のサンプル記事を使います。別の Markdown ディレクトリを確認するときは `CONTENT_DIR` を指定できます。

```sh
CONTENT_DIR=/path/to/articles vp run dev
```

`mimifuwa.cc-content` の CLI から起動する場合は `mimifuwacc dev --content articles` を使います。詳細は [content development](./packages/cli/README.md) を参照してください。

## 確認

```sh
vp check
vp run -r build
```

## デプロイ

- `main` への push は <https://preview.mimifuwa.cc> へ自動デプロイします。Posts と Works は `packages/content-preview` のサンプルを表示します。
- `vX.Y.Z` tag は CLI を GitHub Packages の `latest` として公開し、`mimifuwa.cc-content` の main を使って本番サイトを SSG でデプロイした後、GitHub Release を作成します。content リポジトリの main へのマージでも、R2 への公開後に同じ手順で本番サイトを再デプロイします。
- `vX.Y.Z-dev.N` や `vX.Y.Z-alpha.N` tag は CLI を対応する GitHub Packages prerelease tag で公開し、preview Worker と `packages/content-preview` の記事をデプロイします。
- Cloudflare API トークンは GitHub Actions 環境シークレットで管理し、Account ID と Worker 名は各環境の変数として管理します。Preview 環境はこのリポジトリの Terraform が設定します。

リリースタグは最新の `main` に対して、確認プロンプト付きのタスクから作成します。

```sh
vp run release -- v5.0.1
```

タグ付け前に対象コミットとデプロイ内容を表示し、`yes` を選んだ場合だけ署名付きタグを作って push します。事前確認には `vp run release -- v5.0.1 --dry-run` を使えます。
