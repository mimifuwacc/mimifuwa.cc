import satori from "satori";
import { BlogPostService } from "../services/blog-post";
import type { DB } from "../db";

export type ResvgConstructor = new (
  svg: string,
) => { render(): { asPng(): Uint8Array } };

function buildElement(title: string) {
  const display = title.length > 60 ? `${title.slice(0, 60)}…` : title;
  return {
    type: "div",
    props: {
      style: {
        width: "1200px",
        height: "630px",
        display: "flex",
        backgroundColor: "#141414",
        position: "relative",
      },
      children: [
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              top: 0,
              left: 0,
              width: "8px",
              height: "100%",
              background: "linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)",
            },
          },
        },
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              padding: "64px 80px",
              width: "100%",
              height: "100%",
            },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    fontSize: "22px",
                    color: "#4b5563",
                    letterSpacing: "3px",
                  },
                  children: "mimifuwa.cc",
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    fontSize: "54px",
                    fontWeight: 700,
                    color: "#f9fafb",
                    lineHeight: 1.4,
                  },
                  children: display,
                },
              },
            ],
          },
        },
      ],
    },
  };
}

export async function handleOgImage(
  slug: string,
  db: DB,
  Resvg: ResvgConstructor,
  fontData: ArrayBuffer,
): Promise<Response> {
  try {
    const service = new BlogPostService(db);
    const post = await service.findBySlug(slug);
    const title = post?.title ?? "mimifuwa.cc";

    // biome-ignore lint/suspicious/noExplicitAny: satori accepts plain objects
    const svg = await satori(buildElement(title) as any, {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Noto Sans JP", data: fontData, weight: 700, style: "normal" },
      ],
    });

    const resvg = new Resvg(svg);
    const png = resvg.render().asPng();

    return new Response(png.buffer as ArrayBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch {
    return new Response(null, { status: 503 });
  }
}
