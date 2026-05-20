import { defineConfig, route } from "haribote";
import { GraphQLClient } from "graphql-request";

const GRAPHQL_URL =
  process.env.VITE_GRAPHQL_URL || "http://localhost:8787/graphql";

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
      try {
        const data = await gqlClient.request<{
          blogPost: { title: string; excerpt: string } | null;
        }>(GET_POST_META, { slug });
        if (!data.blogPost) {
          return { title: `${slug} - mimifuwa.cc`, description: "ブログ記事" };
        }
        return {
          title: `${data.blogPost.title} - mimifuwa.cc`,
          description: data.blogPost.excerpt,
          ogType: "article",
          ogUrl: `https://mimifuwa.cc/blogs/${slug}`,
        };
      } catch {
        return { title: `${slug} - mimifuwa.cc`, description: "ブログ記事" };
      }
    }),
    route("/links", {
      title: "相互リンク - mimifuwa.cc",
      description: "知り合いのオタクのサイトたちです",
      ogUrl: "https://mimifuwa.cc/links",
    }),
  ],
});
