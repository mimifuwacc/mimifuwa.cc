import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import parser from "@/lib/parser";
import { currentUrl } from "@/lib/url";
import { Section } from "../../(index)/_components/section";

export async function generateStaticParams() {
  const postsDirectory = path.join(process.cwd(), "src/contents/blogs");
  const filenames = await fs.promises.readdir(postsDirectory);

  return filenames
    .filter((filename) => filename.endsWith(".md"))
    .map((filename) => ({
      slug: filename.replace(/\.md$/, ""),
    }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const postPath = path.join(
    process.cwd(),
    "src/contents/blogs/",
    `${resolvedParams.slug}.md`,
  );
  const apiUrl = currentUrl();

  try {
    const fileContent = await fs.promises.readFile(postPath, "utf8");
    const parsed = await parser(fileContent);

    const title = (parsed.frontmatter.title as string) || resolvedParams.slug;
    const excerpt = (parsed.frontmatter.excerpt as string) || "ブログ記事";
    const date = parsed.frontmatter.date as string;
    const tags = Array.isArray(parsed.frontmatter.tags)
      ? parsed.frontmatter.tags
      : [];

    return {
      title: `${title} - mimifuwa.cc`,
      description: excerpt,
      openGraph: {
        title: `${title} - mimifuwa.cc`,
        description: excerpt,
        type: "article",
        publishedTime: date,
        tags: tags,
        url: `${apiUrl}/blogs/${resolvedParams.slug}`,
        images: {
          url: `${apiUrl}/api/blog/og?slug=${resolvedParams.slug}`,
          width: 1200,
          height: 630,
          alt: `${title} - mimifuwa.cc`,
        },
      },
      twitter: {
        card: "summary_large_image",
        title: `${title} - mimifuwa.cc`,
        description: excerpt,
        images: [`${apiUrl}/api/blog/og?slug=${resolvedParams.slug}`],
      },
    };
  } catch (_error) {
    return {
      title: `${resolvedParams.slug} - mimifuwa.cc`,
      description: "ブログ記事",
    };
  }
}

export default async function Page(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const postPath = path.join(
    process.cwd(),
    "src/contents/blogs/",
    `${params.slug}.md`,
  );

  try {
    const fileContent = await fs.promises.readFile(postPath, "utf8");
    const parsed = await parser(fileContent);

    const title = (parsed.frontmatter.title as string) || params.slug;
    const date = (parsed.frontmatter.date as string) || "";
    const tags = (parsed.frontmatter.tags as string[]) || [];

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
      <div className="py-12 sm:py-24">
        {/* メインコンテンツ */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* 記事ヘッダー */}
          <header className="mb-12 text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-slate-900 leading-tight">
              {title}
            </h1>

            {/* メタ情報 */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-slate-600 mb-6">
              {date && (
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    role="img"
                    aria-label="日付"
                  >
                    <title>日付</title>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <time dateTime={date}>{formatDate(date)}</time>
                </div>
              )}

              {tags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap justify-center">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    role="img"
                    aria-label="タグ"
                  >
                    <title>タグ</title>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-cyan-600 text-white text-sm rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </header>

          {/* 記事本文 */}
          <article className="prose-custom max-w-4xl mx-auto">
            {parsed.content}
          </article>
        </div>
      </div>
    );
  } catch (_error) {
    return (
      <Section
        id="blog-error"
        title="記事が見つかりません"
        subtitle="お探しの記事は存在しないか、削除された可能性があります。"
      >
        <div className="text-center">
          <p>お探しの記事は存在しないか、削除された可能性があります。</p>
        </div>
      </Section>
    );
  }
}
