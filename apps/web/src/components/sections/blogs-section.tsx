import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { BlogCard } from "@/components/blog-card";
import { RECENT_POSTS_COUNT } from "@/lib/constants";
import { useRecentPosts } from "@/lib/query/blog";

export default function BlogsSection() {
  const { data: recentPosts } = useRecentPosts(RECENT_POSTS_COUNT);

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
