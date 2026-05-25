import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@mimifuwacc/ui/components/ui/badge";
import { Card, CardContent } from "@mimifuwacc/ui/components/ui/card";
import { type BlogPost, useRecentPosts } from "@/lib/query/blog";

export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link viewTransition to={`/blogs/${post.slug}`} className="group block h-full">
      <Card className="h-full hover:shadow-lg transition-shadow duration-200 overflow-hidden py-0">
        <div className="w-full aspect-1200/630 overflow-hidden">
          <img src={post.ogImageUrl} alt={post.title} className="w-full h-full object-cover" />
        </div>
        <CardContent className="flex flex-col gap-2 pt-0 pb-4">
          <p className="text-sm text-foreground line-clamp-2">{post.excerpt}</p>
          <div className="flex items-center justify-between gap-2 mt-1">
            <div className="flex flex-wrap gap-1.5">
              {post.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary">
                  #{tag}
                </Badge>
              ))}
              {post.tags.length > 3 && <Badge variant="outline">+{post.tags.length - 3}</Badge>}
            </div>
            <p className="text-xs text-muted-foreground shrink-0">
              {new Date(post.date).toLocaleDateString("ja-JP", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function BlogsSection() {
  const { data: recentPosts } = useRecentPosts(6);

  if (!recentPosts || recentPosts.length === 0) return null;

  return (
    <section id="blog-section" className="py-12 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-12 px-2">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground/70 mb-2">Blogs</h2>
          <div className="w-8 h-0.5 bg-primary mb-3" />
          <p className="text-sm text-muted-foreground mb-3">主に趣味について書いています</p>
          <Link
            viewTransition
            to="/blogs"
            className="inline-flex items-center gap-1.5 text-sm border border-border rounded-full px-3 py-1 text-muted-foreground"
          >
            すべての記事を見る
            <ArrowRight className="size-3" />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {recentPosts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}
