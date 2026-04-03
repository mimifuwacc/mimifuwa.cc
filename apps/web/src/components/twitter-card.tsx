"use client";

export default function TwitterCard({ url }: { url: string }) {
  const cleanUrl = url
    .replace(/^https:\/\/x\.com/, "https://twitter.com")
    .split("?")[0];
  return (
    <div className="flex justify-center">
      <blockquote className="twitter-tweet" data-lang="ja">
        <a
          href={`${cleanUrl}?ref_src=twsrc%5Etfw`}
        >{`${cleanUrl}?ref_src=twsrc%5Etfw`}</a>
      </blockquote>
    </div>
  );
}
