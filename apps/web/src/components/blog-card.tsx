import { Link } from "react-router-dom";
import { Badge } from "@mimifuwacc/ui/components/ui/badge";
import { Card, CardContent } from "@mimifuwacc/ui/components/ui/card";
import { MAX_VISIBLE_TAGS } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import type { BlogPost } from "@/lib/query/blog";

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
              {post.tags.slice(0, MAX_VISIBLE_TAGS).map((tag) => (
                <Badge key={tag} variant="secondary">
                  #{tag}
                </Badge>
              ))}
              {post.tags.length > MAX_VISIBLE_TAGS && (
                <Badge variant="outline">+{post.tags.length - MAX_VISIBLE_TAGS}</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground shrink-0">{formatDate(post.date)}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
