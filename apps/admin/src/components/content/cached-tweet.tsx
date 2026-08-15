import {
  formatTweetDate,
  formatTweetMetric,
  tweetTextParts,
  visibleTweetText,
  type TwitterEmbed,
} from "@mimifuwacc/blog-ui";
import { useQuery } from "@tanstack/react-query";
import { Heart, MessageCircle, Repeat2 } from "lucide-react";

const twitterPath =
  "M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z";

const apiBaseUrl = () => {
  const configured = import.meta.env.VITE_API_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  if (typeof location === "undefined") {
    return process.env.API_URL?.replace(/\/$/, "") ?? "http://localhost:8787";
  }
  if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
    return "http://localhost:8787";
  }
  return location.hostname.includes("-dev.")
    ? "https://mimifuwacc-api-dev.m8c.workers.dev"
    : "https://api.mimifuwa.cc";
};

const getTweet = async (id: string) => {
  const response = await fetch(`${apiBaseUrl()}/embeds/twitter/${id}`);
  if (!response.ok) throw new Error(`Twitter embed returned ${response.status}`);
  return response.json() as Promise<TwitterEmbed>;
};

export function CachedTweet({ id }: { id: string }) {
  const { data: tweet, isError } = useQuery({
    queryKey: ["twitter-embed", id],
    queryFn: () => getTweet(id),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
  const fallbackUrl = `https://twitter.com/i/status/${id}`;
  if (isError) {
    return (
      <a
        className="cached-tweet cached-tweet-missing"
        data-cached-embed="twitter-missing"
        data-tweet-id={id}
        href={fallbackUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        <strong>ポストを Twitter で表示</strong>
        <small>埋め込みを取得できませんでした</small>
      </a>
    );
  }
  if (!tweet)
    return (
      <div className="cached-tweet" aria-busy="true">
        Twitter の投稿を読み込んでいます...
      </div>
    );

  const date = formatTweetDate(tweet.createdAt);
  const text = visibleTweetText(tweet);
  return (
    <article className="cached-tweet" data-cached-embed="twitter" data-tweet-id={id}>
      <header className="cached-tweet-header">
        {tweet.author.avatarUrl && (
          <img
            className="cached-tweet-avatar"
            src={tweet.author.avatarUrl}
            alt=""
            width="48"
            height="48"
            loading="lazy"
          />
        )}
        <div className="cached-tweet-author">
          <strong>{tweet.author.name}</strong>
          <span>@{tweet.author.username}</span>
        </div>
        <span className="cached-tweet-brand" aria-label="Twitter">
          <svg
            className="icon cached-tweet-twitter-icon"
            viewBox="0 0 512 512"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d={twitterPath} />
          </svg>
        </span>
      </header>
      {text && (
        <p className="cached-tweet-text">
          {tweetTextParts(text).map((part, index) =>
            part.href ? (
              <a
                key={`${index}-${part.value}`}
                href={part.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {part.value}
              </a>
            ) : (
              part.value
            ),
          )}
        </p>
      )}
      {tweet.linkCard && (
        <a
          className="cached-tweet-link-card"
          href={tweet.linkCard.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {tweet.linkCard.imageUrl && (
            <img src={tweet.linkCard.imageUrl} alt={tweet.linkCard.imageAlt ?? ""} loading="lazy" />
          )}
          <span className="cached-tweet-link-card-content">
            {tweet.linkCard.domain && <small>{tweet.linkCard.domain}</small>}
            <strong>{tweet.linkCard.title}</strong>
            {tweet.linkCard.description && <span>{tweet.linkCard.description}</span>}
          </span>
        </a>
      )}
      {tweet.media.length > 0 && (
        <div
          className={`cached-tweet-media cached-tweet-media-${Math.min(tweet.media.length, 4)}${tweet.media.length > 1 ? " cached-tweet-media-grid" : ""}`}
        >
          {tweet.media.slice(0, 4).map((media) => (
            <img
              key={media.url}
              src={media.url}
              alt={media.alt}
              width={media.width}
              height={media.height}
              loading="lazy"
            />
          ))}
        </div>
      )}
      <footer className="cached-tweet-footer">
        {date && <time dateTime={tweet.createdAt}>{date}</time>}
        <span className="cached-tweet-metrics">
          <span
            className="cached-tweet-action-reply"
            aria-label={`返信 ${tweet.metrics.replies ?? 0}`}
            title="返信"
          >
            <MessageCircle aria-hidden="true" />
            <span>{formatTweetMetric(tweet.metrics.replies)}</span>
          </span>
          <span
            className="cached-tweet-action-retweet"
            aria-label={`リツイート ${tweet.metrics.retweets ?? 0}`}
            title="リツイート"
          >
            <Repeat2 aria-hidden="true" />
            <span>{formatTweetMetric(tweet.metrics.retweets)}</span>
          </span>
          <span
            className="cached-tweet-action-like"
            aria-label={`いいね ${tweet.metrics.likes ?? 0}`}
            title="いいね"
          >
            <Heart aria-hidden="true" />
            <span>{formatTweetMetric(tweet.metrics.likes)}</span>
          </span>
        </span>
        <a href={tweet.url} target="_blank" rel="noopener noreferrer">
          Twitter で表示
        </a>
      </footer>
    </article>
  );
}
