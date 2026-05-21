import { defineConfig, route } from "haribote";
import { GraphQLClient } from "graphql-request";

const GRAPHQL_URL =
  process.env.VITE_GRAPHQL_URL || "http://localhost:8000/graphql";

const API_BASE = GRAPHQL_URL.replace(/\/graphql$/, "");

const gqlClient = new GraphQLClient(GRAPHQL_URL);

const GET_POST_META = `
  query GetPostMeta($slug: String!) {
    blogPost(slug: $slug) {
      title
      excerpt
    }
  }
`;

export default defineConfig({
  defaults: {
    twitterCard: "summary_large_image",
    ogImage: "https://mimifuwa.cc/og.png",
    ogType: "website",
  },
  routes: [
    route("/", {
      title: "mimifuwa.cc",
      description: "mimifuwaccのポートフォリオサイト",
      ogUrl: "https://mimifuwa.cc",
    }),
    route("/blogs", {
      title: "ブログ - mimifuwa.cc",
      description: "主に趣味について書いています",
      ogUrl: "https://mimifuwa.cc/blogs",
    }),
    route("/blogs/*", async ({ url }) => {
      const pathname = new URL(url, "http://localhost").pathname;
      const slug = pathname.replace(/^\/blogs\//, "");
      const base = {
        ogType: "article",
        ogUrl: `https://mimifuwa.cc/blogs/${slug}`,
        ogImage: `${API_BASE}/og/${slug}`,
      };
      try {
        const data = await gqlClient.request<{
          blogPost: { title: string; excerpt: string } | null;
        }>(GET_POST_META, { slug });
        if (!data.blogPost) {
          return { ...base, title: "mimifuwa.cc", description: "ブログ記事が見つかりませんでした" };
        }
        return {
          ...base,
          title: `${data.blogPost.title} - mimifuwa.cc`,
          description: data.blogPost.excerpt,
        };
      } catch {
        return { ...base, title: "mimifuwa.cc", description: "mimifuwaccのブログ" };
      }
    }),
    route("/links", {
      title: "相互リンク - mimifuwa.cc",
      description: "知り合いのオタクのサイトたちです",
      ogUrl: "https://mimifuwa.cc/links",
    }),
  ],
});
