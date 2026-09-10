# Embed Contract

記事本文に含まれる外部コンテンツは，取得のタイミングにかかわらず，初期 HTML のレイアウトを変えてはならない．

## 不変条件

すべての embed は次のいずれかを満たす．

1. build 時に内容と media を解決し，最終表示に近い静的 HTML を出力する．
2. build 時に解決できない場合，最終表示と同じ geometry を持つ fallback を出力する．

client 側の処理は既存の embed 領域内だけを更新し，新しい block を挿入したり，親要素の高さを後から変更したりしてはならない．

## Embed snapshot

Content pipeline は外部コンテンツを直接 HTML に埋め込まず，次の意味モデルを経由する．

```ts
type EmbedSnapshot = {
  kind: "twitter" | "ogp" | "youtube" | "image" | "video";
  id: string;
  media: readonly string[];
  width?: number;
  height?: number;
  aspectRatio?: string;
  content: unknown;
  fallback: unknown;
};
```

snapshot は build cache に保存できる．cache が存在しない場合や取得に失敗した場合も，renderer は同じ wrapper と geometry を使用する．

## Geometry rules

- 画像は `width` と `height`，または `aspect-ratio` を持つ．
- 動画と iframe は aspect ratio を持つ．
- OGP card は画像領域の aspect ratio と本文の最大行数を固定する．
- Twitter card は build 時の media metadata を使い，fallback と同じ padding と最小高さを持つ．
- client enhancement は wrapper の `min-height`，`aspect-ratio`，padding を変更しない．

## Embed kinds

| kind      | build 時の処理                                     | client の責務               |
| --------- | -------------------------------------------------- | --------------------------- |
| `twitter` | 投稿本文，media，author，日時を snapshot 化        | 必要なら widget enhancement |
| `ogp`     | title，description，image，hostname を snapshot 化 | 追加 fetch なし             |
| `youtube` | video ID と 16:9 wrapper を生成                    | iframe の遅延 mount         |
| `image`   | intrinsic dimensions を取得                        | lazy load のみ              |
| `video`   | poster と dimensions を確定                        | playback controls のみ      |

## Failure behavior

外部サービスが利用できない場合，元 URL と静的 fallback を表示する．エラー表示のために新しい領域を追加してはならない．

外部サービスの取得は build の再現性を壊さないよう，timeout，cache，取得日時，失敗理由を記録する．

## Validation

各 embed fixture について，次を検証する．

- build 前後の wrapper の bounding box が同じである．
- media の読み込み失敗時にも layout shift が発生しない．
- JavaScript を無効にしても fallback が成立する．
- cache hit と cache miss が同じ geometry を出力する．
- mobile と desktop の両方で CLS が発生しない．
