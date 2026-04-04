# ローカル開発環境のセットアップ

## 概要

ローカル開発環境では、全てのサービス（D1, R2, APIサーバー）をローカルで実行します。

## サービスの起動

### 1. APIサーバーの起動

```bash
cd apps/api
pnpm dev
```

これで`http://localhost:8787`でGraphQL APIが利用可能になります。

- ローカルのD1データベース（`.wrangler/state/v3/d1/miniflare-D1DatabaseObject`）を使用
- ローカルのR2バケット（`.wrangler/state/v3/r2`）を使用

### 2. Adminアプリの起動

```bash
cd apps/admin
pnpm dev
```

これで`http://localhost:3002`でadminアプリが利用可能になります。

### 3. Webアプリの起動

```bash
cd apps/web
pnpm dev
```

これで`http://localhost:3000`でwebアプリが利用可能になります。

## ローカルD1/R2のマイグレーション

初回のみ、ローカルのD1データベースにマイグレーションを適用する必要があります：

```bash
cd apps/api
pnpm wrangler d1 execute mimifuwacc-blogs --local --file=drizzle/0000_brainy_la_nuit.sql
```

## データの永続化

ローカルのD1/R2データは`.wrangler/state`ディレクトリに保存されます。
このディレクトリを`.gitignore`に追加して、コミットされないようにしてください。

## リモート環境への切り替え

リモートのdevel環境を使用したい場合：

```bash
cd apps/api
pnpm dev:remote
```

ただし、adminアプリの`next.config.js`でローカルのAPIエンドポイント（`http://localhost:8787`）を
指しているため、環境変数で上書きする必要があります：

```bash
GRAPHQL_URL=https://mimifuwacc-api-devel.mimifuwacc.workers.dev/graphql pnpm dev
```
