"use client";

import { useEffect } from "react";

export default function TwitterCard({ url }: { url: string }) {
  useEffect(() => {
    // 既にロード済みならwidgets.load()を呼ぶだけ
    if (window.twttr) {
      window.twttr.widgets.load();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://platform.twitter.com/widgets.js";
    script.async = true;
    script.onload = () => {
      if (window.twttr) {
        window.twttr.widgets.load();
      }
    };
    document.body.appendChild(script);
  }, []);

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
