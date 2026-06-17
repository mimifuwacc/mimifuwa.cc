---
title: "NowPlayingを少しおしゃれにする Part2"
excerpt: "ハーフダチョウ研究会Advent Calendar 2025 2日目の記事です。"
date: 2025-12-02
tags: ["adventar2025", "技術"]
---

この記事は [ハーフダチョウ研究会Advent Calendar 2025](https://adventar.org/calendars/11432) の2日目の記事です。

昨日は [NowPlayingを少しおしゃれにする Part1](https://mimifuwa.cc/blogs/adventar2025/day-1) で拡張機能部分の話をしました。
今日は、OGP生成部分やデプロイの話をしようと思います。

## APIから楽曲データを取得して画像を生成

YouTubeから楽曲データを取得してきます。ドキュメントに書いてある通りにAPIキーを発行して、情報が欲しい動画のIDとAPIキーを渡して叩くだけで取得できます。

https://developers.google.com/youtube/v3

```ts
const apiKey = process.env.YOUTUBE_DATA_API_KEY;
if (!apiKey) {
  throw new Error("YouTube Data API key is not configured");
}

const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet`;

const response = await fetch(apiUrl);
if (!response.ok) {
  throw new Error(`YouTube API request failed: ${response.status}`);
}

const data = await response.json();

if (!data.items || data.items.length === 0) {
  throw new Error("Video not found");
}

const video = data.items[0];
const snippet = video.snippet;
```

これで取得したデータを元にsatoriを使ってOG画像を動的に生やすだけです。

## OG画像を生成

satoriを使って画像を生成していきます。脳死で技術選定をしたので、Next.jsを使っています（？）。

https://github.com/vercel/satori

結果的にVercelにデプロイすることになったので、`@vercel/og` を使っても良かったかも。

### 背景画像を作成

早速実装していきます。背景にカバーアートをぼかして入れたいので、`position: absolute;` で背面に表示していきます。

```ts
const svg = await satori(
  // 親要素
  React.createElement(
    "div",
    {
      style: {
        display: "flex",
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
      },
    },
    // 背景にぼかした画像
    React.createElement("img", {
      src: videoData.thumbnail,
      style: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        height: "1200px",
        textAlign: "center",
        filter: "blur(10px)",
      },
    }),
    // そのまま背景画像を表示すると明るすぎるので暗くする
    React.createElement("div", {
      style: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "100%",
        height: "100%",
        textAlign: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      },
    }),

    // 中身
  ),
  // ...省略
);
```

### 楽曲情報を表示する部分を作成

次に楽曲情報を載せていきます。最初LLMに書かせたのですが、ものすごくCSSが下手だったので人間が結局書きました。全体のバランスなど微妙な調整も人間がやってあげないといけないので、人類はまだ敗北していません。

ちょっと長いですが、こちらもソースコードを全部載せておきます。

```ts
React.createElement(
  "div",
  {
    style: {
      height: "100%",
      width: "100%",
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-start",
      gap: "64px",
      fontFamily: "Noto Sans JP",
      padding: "0 75px",
      boxSizing: "border-box",
    },
  },
  // カバーアート
  React.createElement("img", {
    src: videoData.thumbnail,
    style: {
      width: "480px",
      height: "480px",
      borderRadius: "16px",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
      objectFit: "cover",
    },
  }),
  // 楽曲情報
  React.createElement(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
        color: "#ffffff",
        width: "506px",
        gap: "8px",
      },
    },
    // タイトル
    React.createElement(
      "h1",
      {
        style: {
          fontSize: "56px",
          fontWeight: 700,
          width: "100%",
          display: "-webkit-box",
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          textOverflow: "ellipsis",
          WebkitLineClamp: 2,
        },
      },
      videoData.title,
    ),
    // アーティスト名
    React.createElement(
      "p",
      {
        style: {
          fontSize: "32px",
          color: "#dddddd",
          textAlign: "center",
          marginTop: "0",
          marginBottom: "32px",
        },
      },
      videoData.channelTitle,
    ),
    // タグ
    React.createElement(
      "p",
      {
        style: {
          fontSize: "24px",
          color: "#555555",
          textAlign: "center",
          marginTop: "0",
          marginBottom: "32px",
          padding: "4px 8px",
          borderRadius: "8px",
          backgroundColor: "rgba(255, 255, 255, 0.8)",
        },
      },
      "#NowPlaying",
    ),
    // 共有されたアプリ
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          color: "#ffffff",
        },
      },
      React.createElement("img", {
        src: `${process.env.BASE_URL}${videoData.serviceIcon}`,
        alt: "#NowPlaying",
        style: {
          width: "56px",
          height: "56px",
        },
      }),
      React.createElement(
        "p",
        {
          style: {
            fontSize: "20px",
            textAlign: "center",
            marginLeft: "10px",
          },
        },
        `from ${videoData.serviceName}`,
      ),
    ),
  ),
);
```

### pngに変換する

https://stackoverflow.com/questions/21636503/use-svg-as-OGImage

この辺を見ていたらどうやらsvgはOG画像として使えないらしいので、pngに変換した後に返すように実装しました。

```ts
const png = await convertSvgToPng(svg);

return new Response(new Uint8Array(png), {
  headers: {
    "Content-Type": "image/png",
    "Cache-Control": "public, max-age=3600",
  },
});
```

これで、画像のURLを投げるとOG画像を動的に返してくれるAPIが立ちました。

## デプロイする

雑にVercelにデプロイしています。
いつもVercel側でGitHubのリポジトリをリンクしてデプロイしてたので、Actionsからデプロイするのが初めてでした。

基本てっきに公式のドキュメントを見ながらやったので、大体こんな感じでいいと思います。

https://vercel.com/kb/guide/how-can-i-use-github-actions-with-vercel

```yaml
jobs:
  deploy-production:
    if: github.event_name == 'workflow_dispatch' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "22"

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install Vercel CLI
        run: pnpm add -g vercel@latest

      - name: Pull Vercel Environment Information
        run: vercel pull --yes --environment=${{ github.event.inputs.environment }} --token=${{ secrets.VERCEL_TOKEN }}

      - name: Build Project
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}

      - name: Deploy to Vercel Production
        run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
```

これで完成したので、曲を共有してみると昨日の記事で紹介したように、綺麗な画像付きでツイートされます。

https://x.com/mimifuwacc/status/1985201959499071975?s=20

## Workersにデプロイしたかった話

さて、しばらく使っていましたが、それなりの勢いで曲を共有すると、Vercelの制限に引っかかってTwitter側でOG画像が表示されないという不具合が出てきました。

もともとNext.jsというのも適当に選んだので、Honoとかに乗り換えてWorersにデプロイしてみようかなとか思っていましたが、OG画像を動的生成するのが少し難しそうと思って避けていました。

そんな時に、Hono + WorkersでOG画像を動的生成するというドンピシャな記事が出ていたので、早速試してみました。

https://zenn.dev/chocolat5/articles/64de392a7132d4

無事Honoで書き直してWorkersにデプロイすることはできたのですが、おそらく画像を贅沢に使っているのが原因で、メモリ使用量が100MiB/1Reqestを超えてしまって

```log
Worker exceeded resource limits
```

と怒られてしまい、残念ながらCloudflare移住計画は失敗に終わりました。

なんにせよ、別の場所に載っけたいので、今月中にAWSに載る気がしています（アドベントカレンダーの記事のためにAWSを勉強したいのでちょうど良いネタになっている）。

## おわりに

というわけで、2日目は「NowPlayingを少しおしゃれにする」のOGP生成部分やデプロイの話でした。明日は、英語の授業を受けていたらSMCを勉強することになった話をしようと思います。
