import { useParams } from "react-router-dom";
import { usePostBySlug } from "@/lib/query/blog";
import ContentRenderer from "@/components/content-renderer";
import { Badge } from "@/components/ui/badge";
import { Section } from "@/components/section";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, Tag } from "lucide-react";

function formatDate(dateString: string) {
  try {
    return new Date(dateString).toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" });
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
      <Section id="blog-error" title="記事が見つかりません" subtitle="お探しの記事は存在しないか、削除された可能性があります。" />
    );
  }

  return (
    <div className="py-12 sm:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <header className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">{post.title}</h1>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-muted-foreground mb-6">
            {post.date && (
              <div className="flex items-center gap-2 text-sm">
                <CalendarDays className="size-4" />
                <time dateTime={post.date}>{formatDate(post.date)}</time>
              </div>
            )}
            {post.tags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <Tag className="size-4" />
                {post.tags.map((tag) => (
                  <Badge key={tag}>#{tag}</Badge>
                ))}
              </div>
            )}
          </div>
          <Separator />
        </header>
        <article>
          <ContentRenderer html={post.content} />
        </article>
      </div>
    </div>
  );
}
