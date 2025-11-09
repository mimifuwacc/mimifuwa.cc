import type { Metadata } from "next";
import { type BlogPost, getAllPosts } from "@/lib/blog";
import { BlogCard } from "../(index)/_components/blogs-section";
import { Section } from "../(index)/_components/section";

export const metadata: Metadata = {
  title: "ブログ - mimifuwa.cc",
  description: "主に趣味について書いています",
};

export default async function BlogsPage() {
  const posts = await getAllPosts();

  return (
    <Section
      id="blogs-page"
      title="ブログ"
      subtitle="主に趣味について書いています"
      icon="📝"
      bg="white"
    >
      {posts.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-gray-400 text-lg mb-4">まだ記事がありません</div>
          <p className="text-gray-500">
            記事が公開され次第、ここに表示されます。
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {posts.map((post: BlogPost) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </Section>
  );
}
