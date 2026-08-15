export interface TwitterEmbed {
  readonly provider: "twitter";
  readonly id: string;
  readonly url: string;
  readonly text: string;
  readonly createdAt?: string;
  readonly author: {
    readonly name: string;
    readonly username: string;
    readonly avatarUrl?: string;
  };
  readonly media: readonly {
    readonly url: string;
    readonly alt: string;
    readonly sourceUrl?: string;
    readonly width?: number;
    readonly height?: number;
  }[];
  readonly linkCard?: {
    readonly url: string;
    readonly sourceUrl?: string;
    readonly title: string;
    readonly description?: string;
    readonly domain?: string;
    readonly imageUrl?: string;
    readonly imageAlt?: string;
  };
  readonly metrics: {
    readonly likes?: number;
    readonly replies?: number;
    readonly retweets?: number;
  };
}

export type ArticlePart =
  | { readonly kind: "html"; readonly value: string }
  | { readonly kind: "twitter"; readonly id: string };

const twitterPlaceholder =
  /<div class="twitter-embed-placeholder" data-twitter-id="([0-9]+)"><\/div>/g;

export function splitArticleHtml(html: string): readonly ArticlePart[] {
  const parts: ArticlePart[] = [];
  let cursor = 0;
  for (const match of html.matchAll(twitterPlaceholder)) {
    const index = match.index ?? 0;
    if (index > cursor) parts.push({ kind: "html", value: html.slice(cursor, index) });
    parts.push({ kind: "twitter", id: match[1] });
    cursor = index + match[0].length;
  }
  if (cursor < html.length) parts.push({ kind: "html", value: html.slice(cursor) });
  return parts.length > 0 ? parts : [{ kind: "html", value: html }];
}

export function visibleTweetText(tweet: TwitterEmbed): string {
  const hiddenUrls = [
    ...(tweet.linkCard?.imageUrl && tweet.linkCard.sourceUrl ? [tweet.linkCard.sourceUrl] : []),
    ...tweet.media.flatMap((media) => (media.sourceUrl ? [media.sourceUrl] : [])),
  ];
  return hiddenUrls.reduce((text, url) => text.replaceAll(url, ""), tweet.text).trimEnd();
}

export interface TweetTextPart {
  readonly value: string;
  readonly href?: string;
}

export function tweetTextParts(text: string): readonly TweetTextPart[] {
  const pattern = /https?:\/\/[^\s]+|#[\p{L}\p{N}_]+/gu;
  const parts: TweetTextPart[] = [];
  let cursor = 0;
  for (const match of text.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > cursor) parts.push({ value: text.slice(cursor, index) });
    const value = match[0];
    parts.push({
      value,
      href: value.startsWith("#")
        ? `https://twitter.com/hashtag/${encodeURIComponent(value.slice(1))}`
        : value,
    });
    cursor = index + value.length;
  }
  if (cursor < text.length) parts.push({ value: text.slice(cursor) });
  return parts;
}

export const formatTweetMetric = (value?: number) =>
  new Intl.NumberFormat("ja-JP", { notation: "compact" }).format(value ?? 0);

export const formatTweetDate = (value?: string) =>
  value
    ? new Intl.DateTimeFormat("ja-JP", { dateStyle: "medium", timeStyle: "short" }).format(
        new Date(value),
      )
    : undefined;
