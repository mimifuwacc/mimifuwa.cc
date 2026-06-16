import ContentRenderer from "@mimifuwacc/ui/components/content-renderer";
import { CalendarDays } from "lucide-react";
import { useParams } from "react-router-dom";
import { Section } from "@/components/section";
import TableOfContents from "@/components/table-of-contents";
import { Badge } from "@mimifuwacc/ui/components/ui/badge";
import { formatDate } from "@/lib/format";
import { usePostBySlug } from "@/lib/query/blog";
import { useTheme } from "@/lib/theme";

export default function BlogPost() {
  const { "*": slugPath = "" } = useParams();
  const { data: post, isPending, isError } = usePostBySlug(slugPath);
  const { theme } = useTheme();

  if (isPending) return null;

  if (isError || !post || !post.content) {
    return (
      <Section
        id="blog-error"
        title="記事が見つかりません"
        subtitle="お探しの記事は存在しないか、削除された可能性があります。"
      />
    );
  }

  return (
    <div className="py-12 sm:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <header className="mb-10 pb-8 border-b border-border">
          {/* タイトル */}
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-3 text-foreground/70">
            {post.title}
          </h1>

          {/* 日付 */}
          {post.date && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
              <CalendarDays className="size-3.5" />
              <time dateTime={post.date}>{formatDate(post.date)}</time>
            </div>
          )}

          {/* タグ */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </header>

        {/* モバイル: 記事上部に折りたたみ式 */}
        <div className="xl:hidden">
          <TableOfContents html={post.content} collapsible />
        </div>

        <div className="flex gap-12">
          <article className="min-w-0 flex-1 self-start">
            <ContentRenderer html={post.content} theme={theme} />
          </article>
          {/* デスクトップ: 右サイドに sticky */}
          <aside className="hidden xl:block w-56 shrink-0">
            <TableOfContents html={post.content} />
          </aside>
        </div>
      </div>
    </div>
  );
}
