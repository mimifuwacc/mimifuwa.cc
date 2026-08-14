import { useEffect, useRef } from "react";

/** widgets.js のロード完了をポーリングする間隔（ミリ秒） */
const WIDGET_POLL_INTERVAL_MS = 100;

export function TwitterCard({ url, theme }: { url: string; theme: "light" | "dark" }) {
  const cleanUrl = url.replace(/^https:\/\/x\.com/, "https://twitter.com").split("?")[0];
  const containerRef = useRef<HTMLDivElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: theme triggers widget reload with updated data-theme attribute
  useEffect(() => {
    const w = window as Window & {
      twttr?: { widgets?: { load: (el?: HTMLElement | null) => void } };
    };
    const load = () => w.twttr?.widgets?.load(containerRef.current);
    if (w.twttr?.widgets) {
      load();
      return;
    }
    if (document.getElementById("twitter-wjs")) {
      const interval = setInterval(() => {
        if ((window as typeof w).twttr?.widgets) {
          clearInterval(interval);
          load();
        }
      }, WIDGET_POLL_INTERVAL_MS);
      return () => clearInterval(interval);
    }
    const js = document.createElement("script");
    js.id = "twitter-wjs";
    js.src = "https://platform.twitter.com/widgets.js";
    js.onload = load;
    document.body.appendChild(js);
  }, [theme]);

  return (
    <div ref={containerRef} className="flex justify-center my-6">
      <blockquote className="twitter-tweet" data-lang="ja" data-theme={theme}>
        <a href={`${cleanUrl}?ref_src=twsrc%5Etfw`} className="invisible">
          {cleanUrl}
        </a>
      </blockquote>
    </div>
  );
}
