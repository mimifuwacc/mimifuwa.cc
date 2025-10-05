import Button from "@/components/button";
import Card from "@/components/card";
import { type BlogPost, getRecentPosts } from "@/lib/blog";
import { Section } from "../section";

export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Card
      className="group overflow-hidden hover:shadow-xl h-full flex flex-col"
      url={`/blogs/${post.slug}`}
    >
      {/* Blog content */}
      <div className="px-2 py-4 flex-1 flex flex-col">
        <div className="text-xs sm:text-sm text-gray-500 mb-3">
          {new Date(post.date).toLocaleDateString("ja-JP", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 group-hover:text-blue-600 transition-colors line-clamp-2">
          {post.title}
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed mb-4 sm:mb-6 line-clamp-3 flex-1">
          {post.excerpt}
        </p>
        <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
          {post.tags.slice(0, 3).map((tag: string) => (
            <span
              key={tag}
              className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
            >
              #{tag}
            </span>
          ))}
          {post.tags.length > 3 && (
            <span className="text-xs text-gray-400">
              +{post.tags.length - 3}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}

const BlogLink = () => (
  <Button url="/blogs" className="mx-auto">
    <span>すべての記事を見る</span>
    <span>→</span>
  </Button>
);

export default async function BlogsSection() {
  const recentPosts = await getRecentPosts(6);

  if (recentPosts.length === 0) {
    return null;
  }

  return (
    <Section
      id="blog-section"
      title="最新のブログ記事"
      subtitle="主に趣味について書いています"
      icon="📝"
      bg="white"
    >
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-10 sm:mb-12">
        {recentPosts.map((post: BlogPost) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>

      <div className="text-center">
        <BlogLink />
      </div>
    </Section>
  );
}
