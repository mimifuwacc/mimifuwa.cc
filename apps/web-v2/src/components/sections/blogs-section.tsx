import Button from "../button";
import Card from "../card";
import { Section } from "../section";
import { useRecentPosts, type BlogPost } from "../../lib/query/blog";

export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Card
      className="group overflow-hidden hover:shadow-xl h-full flex flex-col"
      href={`/blogs/${post.slug}`}
    >
      <div className="px-2 py-4 flex-1 flex flex-col">
        <div className="text-xs sm:text-sm text-slate-500 mb-3">
          {new Date(post.date).toLocaleDateString("ja-JP", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-3 sm:mb-4 group-hover:text-cyan-600 transition-colors line-clamp-2">
          {post.title}
        </h3>
        <p className="text-slate-600 text-sm leading-relaxed mb-4 sm:mb-6 line-clamp-3 flex-1">
          {post.excerpt}
        </p>
        <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
          {post.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-slate-100 text-slate-600 text-xs rounded-full"
            >
              #{tag}
            </span>
          ))}
          {post.tags.length > 3 && (
            <span className="text-xs text-slate-400">
              +{post.tags.length - 3}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function BlogsSection() {
  const { data: recentPosts } = useRecentPosts(6);

  return (
    <Section id="blog-section" title="Blogs" subtitle="主に趣味について書いています">
      {recentPosts && recentPosts.length > 0 && (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-10 sm:mb-12">
            {recentPosts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
          <div className="text-center">
            <Button url="/blogs" className="mx-auto">
              <span>すべての記事を見る</span>
              <span>→</span>
            </Button>
          </div>
        </>
      )}
    </Section>
  );
}
