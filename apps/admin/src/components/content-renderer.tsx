import { splitArticleHtml } from "@mimifuwacc/blog-ui";
import { useEffect, useRef } from "react";
import { CachedTweet } from "./content/cached-tweet";

export default function ContentRenderer({ html }: { html: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const parts = splitArticleHtml(html);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const controller = new AbortController();
    for (const card of root.querySelectorAll<HTMLAnchorElement>("[data-ogp-url]")) {
      const url = card.dataset.ogpUrl;
      if (!url) continue;
      void fetch(`/api/ogp?url=${encodeURIComponent(url)}`, { signal: controller.signal })
        .then((response) => (response.ok ? response.json() : undefined))
        .then((ogp: { title?: string; description?: string; image?: string } | undefined) => {
          if (!ogp) return;
          const title = card.querySelector<HTMLElement>(".embedded-link-title");
          const description = card.querySelector<HTMLElement>(".embedded-link-description");
          const imageContainer = card.querySelector<HTMLElement>(".embedded-link-image");
          const image = imageContainer?.querySelector<HTMLImageElement>("img");
          if (title && ogp.title) title.textContent = ogp.title;
          if (description && ogp.description) {
            description.textContent = ogp.description;
            description.hidden = false;
          }
          if (imageContainer && image && ogp.image) {
            try {
              const imageUrl = new URL(ogp.image);
              if (imageUrl.protocol === "http:" || imageUrl.protocol === "https:") {
                image.src = imageUrl.toString();
                image.alt = ogp.title ?? "";
                image.addEventListener(
                  "error",
                  () => {
                    imageContainer.hidden = true;
                  },
                  { once: true },
                );
                imageContainer.hidden = false;
              }
            } catch {
              imageContainer.hidden = true;
            }
          }
        })
        .catch(() => undefined);
    }
    const copyButtons = root.querySelectorAll<HTMLButtonElement>(".code-copy");
    const copy = (event: Event) => {
      const button = event.currentTarget as HTMLButtonElement;
      const code = button.closest(".code-block")?.querySelector("code")?.textContent;
      if (code !== undefined) void navigator.clipboard.writeText(code);
    };
    copyButtons.forEach((button) => button.addEventListener("click", copy));
    return () => {
      controller.abort();
      copyButtons.forEach((button) => button.removeEventListener("click", copy));
    };
  }, [html]);

  return (
    <div ref={rootRef}>
      {parts.map((part, index) =>
        part.kind === "twitter" ? (
          <CachedTweet key={`twitter-${part.id}-${index}`} id={part.id} />
        ) : (
          <div
            className="article-html-fragment"
            key={`html-${index}`}
            dangerouslySetInnerHTML={{ __html: part.value }}
          />
        ),
      )}
    </div>
  );
}
