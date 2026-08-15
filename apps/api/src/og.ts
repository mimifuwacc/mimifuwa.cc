import { ImageResponse } from "@cloudflare/pages-plugin-vercel-og/api";
import { Effect } from "effect";
import type { Env } from "./repository";
import { getPost } from "./repository";

const headers = {
  "content-type": "image/png",
  "cache-control": "public, max-age=31536000, immutable",
};
let font: ArrayBuffer | undefined;
let avatar: string | undefined;

const loadFont = async () => {
  if (font) return font;
  const response = await fetch(
    "https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-jp@5/files/noto-sans-jp-japanese-700-normal.woff",
  );
  if (!response.ok) throw new Error("Unable to load the OGP font");
  font = await response.arrayBuffer();
  return font;
};

const loadAvatar = async () => {
  if (avatar) return avatar;
  const response = await fetch(
    "https://raw.githubusercontent.com/mimifuwacc/mimifuwa.cc/dev/apps/web/public/mimifuwacc.png",
  );
  if (!response.ok) throw new Error("Unable to load the avatar");
  const bytes = new Uint8Array(await response.arrayBuffer());
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  avatar = `data:image/png;base64,${btoa(binary)}`;
  return avatar;
};

const element = (title: string, tags: readonly string[], avatarUrl?: string) => ({
  type: "div",
  props: {
    style: {
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      background: "linear-gradient(135deg, #f0f7fa, #ddeef5)",
      padding: "52px 64px",
      color: "#0f172a",
      fontFamily: "Noto Sans JP",
    },
    children: [
      {
        type: "div",
        props: {
          style: { display: "flex", gap: 10 },
          children: tags.slice(0, 5).map((tag) => ({
            type: "span",
            props: {
              style: {
                borderRadius: 9999,
                background: "rgba(100,116,139,.12)",
                padding: "5px 16px",
                color: "#64748b",
                fontSize: 20,
              },
              children: `#${tag}`,
            },
          })),
        },
      },
      {
        type: "div",
        props: {
          style: {
            display: "flex",
            flex: 1,
            alignItems: "center",
            fontSize: title.length > 40 ? 52 : 64,
            fontWeight: 700,
            lineHeight: 1.3,
          },
          children: title,
        },
      },
      {
        type: "div",
        props: {
          style: { display: "flex", alignItems: "center", gap: 12, color: "#475569", fontSize: 24 },
          children: [
            ...(avatarUrl
              ? [
                  {
                    type: "img",
                    props: {
                      src: avatarUrl,
                      width: 40,
                      height: 40,
                      style: { borderRadius: 9999 },
                    },
                  },
                ]
              : []),
            "id:mimifuwacc",
          ],
        },
      },
    ],
  },
});

export const getOgImage = async (env: Env, slug: string): Promise<Response> => {
  const key = `og/v2/${slug}.png`;
  const cached = await env.R2.get(key);
  if (cached) return new Response(cached.body, { headers });

  const result = await Effect.runPromise(Effect.either(getPost(env, slug)));
  if (result._tag === "Left") return new Response(null, { status: 503 });
  if (!result.right) {
    return Response.redirect(
      "https://raw.githubusercontent.com/mimifuwacc/mimifuwa.cc/dev/apps/web/public/og.png",
      302,
    );
  }

  try {
    const image = new ImageResponse(
      element(
        result.right.title,
        result.right.tags,
        await loadAvatar().catch(() => undefined),
      ) as never,
      {
        width: 1200,
        height: 630,
        fonts: [{ name: "Noto Sans JP", data: await loadFont(), weight: 700 }],
      },
    );
    const bytes = await image.arrayBuffer();
    await env.R2.put(key, bytes, { httpMetadata: { contentType: "image/png" } });
    return new Response(bytes, { headers });
  } catch (error) {
    console.error(error);
    return new Response(null, { status: 503 });
  }
};
