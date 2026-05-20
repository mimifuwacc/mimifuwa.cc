import { Section } from "../components/section";
import { BlogCard } from "../components/sections/blogs-section";
import { useAllPosts } from "../lib/query/blog";

export default function BlogList() {
  const { data: posts, isError } = useAllPosts();

  return (
    <div className="bg-slate-100">
      <Section id="blogs-page" title="Blogs" subtitle="主に趣味について書いています">
        {isError && (
          <div className="text-center py-16">
            <p className="text-slate-500">記事の読み込みに失敗しました。</p>
          </div>
        )}
        {!isError && posts?.length === 0 && (
          <div className="text-center py-16">
            <div className="text-slate-400 text-lg mb-4">まだ記事がありません</div>
            <p className="text-slate-500">記事が公開され次第、ここに表示されます。</p>
          </div>
        )}
        {posts && posts.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {posts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
