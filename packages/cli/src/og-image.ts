import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const rendererVersion = "browser-run-1";

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });

const wrapText = (value: string, limit: number, maxLines: number) => {
  const words = value.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const characters = Array.from(word);
    if (characters.length > limit) {
      if (line) {
        lines.push(line);
        line = "";
      }
      for (let offset = 0; offset < characters.length; offset += limit) {
        lines.push(characters.slice(offset, offset + limit).join(""));
      }
      continue;
    }

    const candidate = line ? `${line} ${word}` : word;
    if (Array.from(candidate).length > limit && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);

  const visible = lines.slice(0, maxLines);
  if (lines.length > maxLines) {
    const last = Array.from(visible[maxLines - 1]);
    visible[maxLines - 1] = `${last.slice(0, limit - 1).join("")}…`;
  }
  return visible.length ? visible : [""];
};

export function createArticleOgHtml({
  title,
  date,
  tags = [],
  section,
}: {
  title: string;
  date?: string;
  tags?: string[];
  section: "posts" | "works";
}) {
  const titleLines = wrapText(title, 20, 2);
  const parsedDate = date ? new Date(date) : undefined;
  const dateLabel =
    parsedDate && Number.isFinite(parsedDate.getTime())
      ? new Intl.DateTimeFormat("en", {
          year: "numeric",
          month: "short",
          day: "numeric",
          timeZone: "UTC",
        }).format(parsedDate)
      : "";
  const visibleTags = tags.slice(0, 4).map((tag) => {
    const characters = Array.from(tag);
    return characters.length > 12 ? `${characters.slice(0, 11).join("")}…` : tag;
  });
  const sectionLabel = section === "posts" ? "POSTS" : "WORKS";
  const fonts = new URLSearchParams({ display: "swap" });
  fonts.append("family", "Noto Sans JP:wght@400;700");
  fonts.append("family", "Noto Sans Mono:wght@400;700");

  return `<!doctype html>
<html lang="ja" data-og-ready="false">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=1200, initial-scale=1">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?${fonts}" rel="stylesheet">
    <style>
      * { box-sizing: border-box; }
      html, body { width: 1200px; height: 630px; margin: 0; overflow: hidden; }
      body { background: #fff; color: #000; font-family: "Noto Sans JP", sans-serif; }
      .canvas { width: 1200px; height: 630px; padding: 60px 72px 50px; display: grid; grid-template-rows: auto 1fr auto; }
      .section { width: max-content; padding: 6px 16px; background: #000; color: #fff; font-size: 19px; line-height: 28px; font-weight: 700; letter-spacing: .04em; }
      .content { align-self: center; }
      .date { margin: 0 0 36px; color: #555; font: 400 24px/1.4 "Noto Sans Mono", monospace; letter-spacing: .01em; }
      h1 { margin: 0; font-size: 66px; line-height: 1.16; font-weight: 700; letter-spacing: -.035em; }
      h1 span { display: block; }
      .tags { display: flex; gap: 12px; margin-top: 36px; }
      .tag { padding: 4px 16px 5px; border: 2px solid #000; font-size: 20px; line-height: 30px; font-weight: 600; }
      footer { justify-self: end; font-size: 30px; line-height: 38px; font-weight: 700; }
    </style>
  </head>
  <body>
    <main class="canvas">
      <div class="section">${sectionLabel}</div>
      <div class="content">
        ${dateLabel ? `<p class="date">${escapeHtml(dateLabel)}</p>` : ""}
        <h1>${titleLines.map((line) => `<span>${escapeHtml(line)}</span>`).join("")}</h1>
        ${visibleTags.length ? `<div class="tags">${visibleTags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}</div>` : ""}
      </div>
      <footer>mimifuwa.cc</footer>
    </main>
    <script>document.fonts.ready.then(() => { document.documentElement.dataset.ogReady = "true"; });</script>
  </body>
</html>`;
}

export async function screenshotArticleOgHtml(html: string) {
  const cacheDir = process.env.OG_IMAGE_CACHE_DIR;
  const signature = createHash("sha256").update(rendererVersion).update(html).digest("hex");
  const cacheName = createHash("sha256").update(html).digest("hex");
  const imagePath = cacheDir ? join(cacheDir, `${cacheName}.png`) : undefined;
  const metadataPath = cacheDir ? join(cacheDir, `${cacheName}.json`) : undefined;
  if (imagePath && metadataPath) {
    try {
      const metadata = JSON.parse(await readFile(metadataPath, "utf8")) as { signature: string };
      if (metadata.signature === signature) return await readFile(imagePath);
    } catch {
      // A missing or partial cache entry is rendered again below.
    }
  }

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  if (!accountId || !apiToken) return undefined;

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/browser-run/screenshot`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        html,
        viewport: { width: 1200, height: 630, deviceScaleFactor: 1 },
        waitForSelector: "html[data-og-ready='true']",
      }),
    },
  );
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Cloudflare Browser Run screenshot failed (${response.status}): ${detail}`);
  }
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("image/png")) {
    throw new Error(`Cloudflare Browser Run returned ${contentType || "an unknown content type"}`);
  }
  const image = Buffer.from(await response.arrayBuffer());
  if (imagePath && metadataPath) {
    await mkdir(cacheDir!, { recursive: true });
    await writeFile(imagePath, image);
    await writeFile(metadataPath, JSON.stringify({ signature }));
  }
  return image;
}
