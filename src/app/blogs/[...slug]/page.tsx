import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import parser from "@/lib/parser";
import { currentUrl } from "@/lib/url";
import { Section } from "../../(index)/_components/section";

const isDevelopment = process.env.NODE_ENV === "development";

export async function generateStaticParams() {
  const postsDirectory = path.join(process.cwd(), "src/contents/blogs");
  const params: { slug: string[] }[] = [];

  async function findMarkdownFiles(dir: string, basePath: string = "") {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        await findMarkdownFiles(fullPath, path.join(basePath, item));
      } else if (item.endsWith(".md")) {
        const filePath = fullPath;
        const fileContent = await fs.promises.readFile(filePath, "utf8");
        const parsed = await parser(fileContent);

        if (isDevelopment || !parsed.frontmatter.draft) {
          const relativePath = path.relative(postsDirectory, filePath);
          const slugPath = relativePath
            .replace(/\.md$/, "")
            .replace(/\\/g, "/");
          const slugArray = slugPath.split("/");

          params.push({
            slug: slugArray,
          });
        }
      }
    }
  }

  await findMarkdownFiles(postsDirectory);

  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const slugPath = resolvedParams.slug.join("/");
  const postPath = path.join(
    process.cwd(),
    "src/contents/blogs/",
    `${slugPath}.md`,
  );
  const apiUrl = currentUrl();

  try {
    const fileContent = await fs.promises.readFile(postPath, "utf8");
    const parsed = await parser(fileContent);

    if (!isDevelopment && parsed.frontmatter.draft) {
      return {
        title: `${slugPath} - mimifuwa.cc`,
        description: "ブログ記事",
      };
    }

    const title = (parsed.frontmatter.title as string) || slugPath;
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
        url: `${apiUrl}/blogs/${slugPath}`,
        images: {
          url: `${apiUrl}/api/blog/og?slug=${slugPath}`,
          width: 1200,
          height: 630,
          alt: `${title} - mimifuwa.cc`,
        },
      },
      twitter: {
        card: "summary_large_image",
        title: `${title} - mimifuwa.cc`,
        description: excerpt,
        images: [`${apiUrl}/api/blog/og?slug=${slugPath}`],
      },
    };
  } catch (_error) {
    return {
      title: `${slugPath} - mimifuwa.cc`,
      description: "ブログ記事",
    };
  }
}

export default async function Page(props: {
  params: Promise<{ slug: string[] }>;
}) {
  const params = await props.params;
  const slugPath = params.slug.join("/");
  const postPath = path.join(
    process.cwd(),
    "src/contents/blogs/",
    `${slugPath}.md`,
  );

  try {
    const fileContent = await fs.promises.readFile(postPath, "utf8");
    const parsed = await parser(fileContent);

    if (!isDevelopment && parsed.frontmatter.draft) {
      throw new Error("Draft post");
    }

    const title = (parsed.frontmatter.title as string) || slugPath;
    const date = (parsed.frontmatter.date as string) || "";
    const tags = (parsed.frontmatter.tags as string[]) || [];

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
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          {/* 記事ヘッダー */}
          <header className="mb-12 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-6 text-slate-700 leading-tight">
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
