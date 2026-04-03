import { client } from "./graphql/client";
import { GET_ALL_SLUGS, GET_POST, GET_POSTS } from "./graphql/queries";

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
}

export interface BlogPostWithContent extends BlogPost {
  content: string;
}

export default async function getFrontmatter(
  markdown: string,
): Promise<BlogPost> {
  // TODO: 必要に応じて実装
  throw new Error("getFrontmatter is deprecated");
}

// ========== GraphQL API ==========

interface GraphQLError {
  message: string;
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: GraphQLError[];
}

async function fetchFromAPI<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  try {
    const data = await client.request<T>(query, variables);
    return data;
  } catch (error) {
    console.error("GraphQL API Error:", error);
    throw error;
  }
}

interface BlogPostsResponse {
  blogPosts: {
    edges: Array<{
      node: {
        id: string;
        slug: string;
        title: string;
        excerpt: string;
        date: string;
        draft: boolean;
        tags: Array<{ name: string }>;
      };
    }>;
    pageInfo: {
      totalCount: number;
    };
  };
}

interface BlogPostResponse {
  blogPost: {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    date: string;
    draft: boolean;
    tags: Array<{ name: string }>;
  } | null;
}

interface AllSlugsResponse {
  blogPosts: {
    edges: Array<{
      node: {
        slug: string;
      };
    }>;
  };
}

// ========== 公開API ==========

export async function getAllPosts(): Promise<BlogPost[]> {
  const data = await fetchFromAPI<BlogPostsResponse>(GET_POSTS, {
    filter: { draft: false },
    page: { first: 100 },
  });

  return data.blogPosts.edges.map((edge) => ({
    slug: edge.node.slug,
    title: edge.node.title,
    date: edge.node.date,
    excerpt: edge.node.excerpt,
    tags: edge.node.tags.map((t) => t.name),
  }));
}

export async function getRecentPosts(count: number): Promise<BlogPost[]> {
  const posts = await getAllPosts();
  return posts.slice(0, count);
}

export async function getPostBySlug(
  slug: string,
): Promise<BlogPostWithContent | null> {
  const data = await fetchFromAPI<BlogPostResponse>(GET_POST, { slug });

  if (!data.blogPost) {
    return null;
  }

  const post = data.blogPost;

  // 下書き記事は非表示
  if (post.draft) {
    return null;
  }

  return {
    slug: post.slug,
    title: post.title,
    date: post.date,
    excerpt: post.excerpt,
    tags: post.tags.map((t) => t.name),
    content: post.content,
  };
}

export async function getAllSlugs(): Promise<string[]> {
  const data = await fetchFromAPI<AllSlugsResponse>(GET_ALL_SLUGS, {
    filter: { draft: false },
    page: { first: 1000 },
  });

  return data.blogPosts.edges.map((edge) => edge.node.slug);
}
