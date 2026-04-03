import type { Metadata } from "next";
import { ContentHydrator } from "@/components/content-hydrator";
import { getPostBySlug } from "@/lib/blog";
import { currentUrl } from "@/lib/url";
import { Section } from "../../(index)/_components/section";

// 動的レンダリングを強制（SSR）
export const dynamic = "force-dynamic";
export const dynamicParams = true;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const slugPath = resolvedParams.slug.join("/");
  const apiUrl = currentUrl();

  try {
    const post = await getPostBySlug(slugPath);

    if (!post) {
      return {
        title: `${slugPath} - mimifuwa.cc`,
        description: "ブログ記事",
      };
    }

    const title = post.title || slugPath;
    const excerpt = post.excerpt || "ブログ記事";
    const date = post.date;
    const tags = post.tags || [];

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

  try {
    const post = await getPostBySlug(slugPath);

    if (!post) {
      throw new Error("Post not found");
    }

    const title = post.title || slugPath;
    const date = post.date || "";
    const tags = post.tags || [];

    // post.contentは既にHTML文字列（R2から取得済み）
    const htmlContent = post.content || "";

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
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
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
          <div className="relative">
            <article
              className="prose-custom max-w-4xl mx-auto"
              // biome-ignore lint/security/noDangerouslySetInnerHtml: サーバーサイドで生成された信頼できるHTML
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
            <ContentHydrator />
          </div>
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
