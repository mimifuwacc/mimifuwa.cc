import { GraphQLClient } from "graphql-request";
import { defineConfig, route } from "haribote";

const GET_POST_META = `
  query GetPostMeta($slug: String!) {
    blogPost(slug: $slug) {
      title
      excerpt
    }
  }
`;

const COMMON = { twitterCard: "summary_large_image" } as const;
const DEFAULT_OG_IMAGE = "https://mimifuwa.cc/og.png";

interface Fetcher {
  fetch: typeof fetch;
}

export function createConfig(graphqlUrl: string, service?: Fetcher) {
  const apiBase = graphqlUrl.replace(/\/graphql$/, "");
  const gqlClient = new GraphQLClient(graphqlUrl, {
    fetch: service ? (url, init) => service.fetch(url as string, init) : fetch,
  });

  return defineConfig({
    defaults: {},
    routes: [
      route("/", {
        ...COMMON,
        title: "mimifuwa.cc",
        description: "mimifuwaccのポートフォリオサイト",
        ogImage: DEFAULT_OG_IMAGE,
        ogType: "website",
        ogUrl: "https://mimifuwa.cc",
      }),
      route("/blogs", {
        ...COMMON,
        title: "ブログ - mimifuwa.cc",
        description: "主に趣味について書いています",
        ogImage: DEFAULT_OG_IMAGE,
        ogType: "website",
        ogUrl: "https://mimifuwa.cc/blogs",
      }),
      route("/blogs/*", async ({ url }) => {
        const pathname = new URL(url, "http://localhost").pathname;
        const slug = pathname.replace(/^\/blogs\//, "");
        const base = {
          ...COMMON,
          ogType: "article",
          ogUrl: `https://mimifuwa.cc/blogs/${slug}`,
          ogImage: `${apiBase}/og/${slug}`,
        };
        try {
          const data = await gqlClient.request<{
            blogPost: { title: string; excerpt: string } | null;
          }>(GET_POST_META, { slug });
          if (!data.blogPost) {
            return {
              ...base,
              title: "mimifuwa.cc",
              description: "ブログ記事が見つかりませんでした",
            };
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
        ...COMMON,
        title: "相互リンク - mimifuwa.cc",
        description: "知り合いのオタクのサイトたちです",
        ogImage: DEFAULT_OG_IMAGE,
        ogType: "website",
        ogUrl: "https://mimifuwa.cc/links",
      }),
    ],
  });
}

// Vite dev server 用（worker.ts は createConfig を直接呼ぶため使用しない）
export default createConfig("http://localhost:8000/graphql");
