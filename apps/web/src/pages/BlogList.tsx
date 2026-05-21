import { Section } from "@/components/section";
import { BlogCard } from "@/components/sections/blogs-section";
import { useAllPosts } from "@/lib/query/blog";

export default function BlogList() {
  const { data: posts, isError } = useAllPosts();

  return (
    <Section id="blogs-page" title="Blogs" subtitle="主に趣味について書いています">
      {isError && (
        <p className="text-center py-16 text-muted-foreground">記事の読み込みに失敗しました。</p>
      )}
      {!isError && posts?.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted-foreground">記事が公開され次第、ここに表示されます。</p>
        </div>
      )}
      {posts && posts.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </Section>
  );
}
