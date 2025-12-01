---
title: "NowPlayingを少しおしゃれにする Part1"
excerpt: "ハーフダチョウ研究会Advent Calendar 2025 1日目の記事です。"
date: 2025-12-01
tags: ["adventar2025", "技術"]
---

この記事は [ハーフダチョウ研究会Advent Calendar 2025](https://adventar.org/calendars/11432) の1日目の記事です。

「一人で走り切る！」と意気込んだからには頑張りますが、何も書けなかったらヰ世界情緒さんの楽曲を紹介することになります。

## つくったもの

今日の記事では、NowPlayingをおしゃれに投稿できるようにした話をします。
NowPlayingを知らない人に向けて解説をしておくと、

> 現在自分が聴いている音楽のタイトル、アーティスト名をシェアする

文化のことです。特にTwitterで盛んだと思います。

このNowPlayingをOGIに色々情報を載せておしゃれにしたのが今回作った「Enhanced NowPlaying」というものです（Enhancedは流石に大袈裟な気がしている）。

https://x.com/mimifuwacc/status/1985160826802876453?s=20

こんな感じで、楽曲のカバーアートや曲名などがのったOGIが設定されたURLを投稿できて、ここをクリックすると楽曲に飛ぶことができます。

普段、YouTube Musicをよく使っていますが、Twitterで共有した時にOGIが表示されず、曲が投稿されていることに気づきにくかったので、こんなものを作ってみました。

リポジトリはこれです。

https://github.com/mimifuwacc/enhanced-nowplaying

## 拡張機能を作る
まず、現在再生している曲を投稿するための拡張機能を作ります（といってもボタン一個追加するだけのシンプルなもの）。

今回は、PlasmoというReactでブラウザ拡張機能が書けるライブラリを使いました。

https://www.plasmo.com/

ただ、最近開発が止まっていそうなのと、wxtという別のライブラリを見つけてそちらの方が良さそうかもしれないという感じで、置き換えようか迷っているところです。

https://wxt.dev/

実装に関しては特に面白みもない、かつLLMにコーディングさせたのでカットします（ちょうどClaude Codeがで始めた頃に作った）。

## YouTube Musicから現在再生中の情報を取得する
Spotifyでは、APIから現在再生中の曲などを取得できますが、YouTubeのAPIにはそんな豪華なものはありません。

しかも、YouTube MusicのWeb版では、現在再生されている曲のIDがURLに反映されません（アドレスバーに出てこない）。つまり、 `window.location.href` のようにしても現在再生中の曲が取得できないです。

そこで、現在再生中のIDを使って開発者ツールでソースをのぞいていると、「`feature=player-title` という内容が含まれる`data-sessionlink` 属性を持つ `a` タグ」がいることを発見し、ここから曲のIDを取得すれば良いとわかりました。

早速以下のように実装しました。まず、IDを含む要素を捕まえます。

```ts
const playerTitleLink = document.querySelector<HTMLAnchorElement>(
        'a[data-sessionlink*="feature=player-title"]'
      );
```

その後、そこから整形した共有用URLを作成します。

```ts
const urlParts = playerTitleLink.href.split("?");
if (urlParts.length > 1) {
  const urlParams = new URLSearchParams(urlParts[1]);
  const videoId = urlParams.get("v");
  if (videoId) {
    const cleanVideoId = videoId.split("&")[0];
    urlToShare = `https://music.youtube.com/watch?v=${cleanVideoId}`;
  }
}
```

最後にこのURLを含む投稿を作るように、Twitterへ飛ばしてあげればおしまいです。

```ts
const shareUrl = `https://nowplaying.mimifuwa.cc/${encodeURIComponent(urlToShare)}`;
const shareText = `#NowPlaying ${shareUrl}`;
window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}`, "_blank");
```

あとは、`nowplaying.mimifuwa.cc` が動的にOGIを作ってくれるようにすれば完成です（が、この記事は明日の内容に回します）。

## 実はSpotifyでも

YouTube Music版を作った後に、Spotifyでも同様のことをして現在再生中の曲を取得できるようにしました。ちょっと複雑ですが、やってることは一緒です。

```ts
const linkWithH1 = document.querySelector<HTMLAnchorElement>("a:has(h1)");
if (linkWithH1?.href) {
  const trackRegex = /:track:([^?]+)/;
  const trackMatch = trackRegex.exec(linkWithH1.href);
  if (trackMatch?.[1]) {
    urlToShare = `https://open.spotify.com/track/${trackMatch[1]}`;
  }
}
```

ちなみにこの記事を書いてて気づいたんですが、この裏技を使うとログインしてなくても現在再生中の曲が取得できて、なんかすごいねになっています。

## iPhoneからも使いたい

Web版を作ってしばらく使っていると、外で音楽を聴いている時にも使いたくなってきました。流石に外で急にパソコンを開いてツイートをし出すのはあまりよろしくない気がするので、どうにかできないかなと考えていたところ、知り合いがiPhoneのショートカットを使ってSpotifyで共有できるようにしているのを見かけ、良さそうだったのでYouTube Music版も作ることにしました。

ちょっと小さいですがこんな感じです。

![iPhoneのショートカット](/images/blogs/adventar-2025/day-1/iphone-shortcut.png)

これでiPhoneでも共有ボタンから投稿できるようになって、かなり良さげになりました。
どこかで共有できるようにしようと思っています。

## おわりに

ということで、1日目は「NowPlayingを少しおしゃれにする」話の投稿機能側でした。
明日はOGIを生成する側の話をしようと思います。