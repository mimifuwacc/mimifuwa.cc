import { useParams } from "react-router-dom";
import { usePostBySlug } from "../lib/query/blog";
import ContentRenderer from "../components/content-renderer";
import { Section } from "../components/section";

function formatDate(dateString: string) {
  try {
    return new Date(dateString).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}

export default function BlogPost() {
  const { "*": slugPath = "" } = useParams();
  const { data: post, isPending, isError } = usePostBySlug(slugPath);

  if (isPending) return null;

  if (isError || !post) {
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

  return (
    <div className="py-12 sm:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <header className="mb-12 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-slate-700 leading-tight">
            {post.title}
          </h1>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-slate-600 mb-6">
            {post.date && (
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-label="日付">
                  <title>日付</title>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <time dateTime={post.date}>{formatDate(post.date)}</time>
              </div>
            )}
            {post.tags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-label="タグ">
                  <title>タグ</title>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 bg-cyan-600 text-white text-sm rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </header>
        <article className="max-w-4xl mx-auto">
          <ContentRenderer html={post.content} />
        </article>
      </div>
    </div>
  );
}
