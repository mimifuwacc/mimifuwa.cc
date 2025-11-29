import fs from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { z } from "zod";
import parser from "@/lib/parser";

// 開発環境かどうかを判定
const isDevelopment = process.env.NODE_ENV === "development";

// フォントファイルを読み込む
const notoSansJpRegular = fs.readFileSync(
  path.join(process.cwd(), "src/app/api/blog/og/fonts/NotoSansJP-Regular.ttf"),
);
const notoSansJpBold = fs.readFileSync(
  path.join(process.cwd(), "src/app/api/blog/og/fonts/NotoSansJP-Bold.ttf"),
);

type BlogOgImageProps = {
  title: string;
  excerpt?: string;
  date?: string;
  tags?: string[];
};

const querySchema = z.object({
  slug: z.string().min(1, "Slug is required"),
});

const BlogOgImage = ({ title, date, tags }: BlogOgImageProps) => {
  // 日付のフォーマット
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div
      style={{
        position: "relative",
        fontSize: 128,
        background: "#F1F5F9", // slate-100
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        fontFamily: "'Noto Sans JP', sans-serif",
        fontWeight: 700,
        color: "#314158", // slate-700
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          backgroundColor: "#f8fafc", // slate-50
          borderRadius: "2rem", // white
          padding: "3rem",
          boxShadow: "0 0 32px rgba(0,0,0,0.1)",
          border: "8px solid #CAD5E2", // slate-300
        }}
      >
        {/* コンテンツ */}
        <div
          style={{
            display: "flex",
            gap: "2rem",
            width: "100%",
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              fontSize: "56px",
              fontWeight: "bold",
              wordBreak: "keep-all",
              overflowWrap: "break-word",
              color: "#0092B8", // cyan-600
            }}
          >
            {title}
          </div>

          {date && (
            <div
              style={{
                fontSize: "24px",
                color: "#64748b",
                marginBottom: "16px",
              }}
            >
              {formatDate(date)}
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: "2rem",
            left: "2rem",
          }}
        >
          {tags && tags.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              {tags.slice(0, 3).map((tag: string) => (
                <div
                  key={tag}
                  style={{
                    display: "flex",
                    padding: "6px 16px",
                    backgroundColor: "#62748E",
                    color: "white",
                    borderRadius: "100vh",
                    fontSize: "1.25rem",
                    fontWeight: "500",
                    alignItems: "center",
                  }}
                >
                  #{tag}
                </div>
              ))}
              {tags.length > 3 && (
                <div
                  style={{
                    display: "flex",
                    padding: "6px 16px",
                    backgroundColor: "#62748E",
                    color: "white",
                    borderRadius: "20px",
                    fontSize: "20px",
                    alignItems: "center",
                  }}
                >
                  +{tags.length - 3}
                </div>
              )}
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: "2rem",
            right: "2rem",
            fontSize: "2rem",
            color: "#94a3b8", // slate-400
            fontWeight: "bold",
          }}
        >
          https://
          <span
            style={{
              color: "#0092B8", // cyan-600
            }}
          >
            mimifuwa.cc
          </span>
        </div>
      </div>
    </div>
  );
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    // Zodでバリデーション
    const parseResult = querySchema.safeParse(queryParams);

    if (!parseResult.success) {
      return new Response("Invalid slug parameter", { status: 400 });
    }

    const { slug } = parseResult.data;

    // ブログ記事のデータを取得
    const postPath = path.join(
      process.cwd(),
      "src/contents/blogs/",
      `${slug}.md`,
    );

    try {
      const fileContent = await fs.promises.readFile(postPath, "utf8");
      const parsed = await parser(fileContent);

      // 開発環境以外で下書き記事の場合は404
      if (!isDevelopment && parsed.frontmatter.draft) {
        return new Response("Blog post not found", { status: 404 });
      }

      const title = (parsed.frontmatter.title as string) || slug;
      const excerpt = (parsed.frontmatter.excerpt as string) || undefined;
      const date = (parsed.frontmatter.date as string) || undefined;
      const tags = (parsed.frontmatter.tags as string[]) || undefined;

      return new ImageResponse(
        <BlogOgImage title={title} excerpt={excerpt} date={date} tags={tags} />,
        {
          width: 1200,
          height: 630,
          fonts: [
            {
              name: "Noto Sans JP",
              data: notoSansJpRegular,
              weight: 400,
              style: "normal",
            },
            {
              name: "Noto Sans JP",
              data: notoSansJpBold,
              weight: 700,
              style: "normal",
            },
          ],
        },
      );
    } catch {
      return new Response("Blog post not found", { status: 404 });
    }
  } catch {
    return new Response("Internal server error", { status: 500 });
  }
}
