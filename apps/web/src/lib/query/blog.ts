import { useQuery } from "@tanstack/react-query";
import { client } from "../graphql/client";
import { GET_POST, GET_POSTS } from "../graphql/queries";

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
    pageInfo: { totalCount: number };
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

async function fetchAllPosts(): Promise<BlogPost[]> {
  const data = await client.request<BlogPostsResponse>(GET_POSTS, {
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

async function fetchPostBySlug(slug: string): Promise<BlogPostWithContent | null> {
  const data = await client.request<BlogPostResponse>(GET_POST, { slug });
  if (!data.blogPost || data.blogPost.draft) return null;
  const post = data.blogPost;
  return {
    slug: post.slug,
    title: post.title,
    date: post.date,
    excerpt: post.excerpt,
    tags: post.tags.map((t) => t.name),
    content: post.content,
  };
}

export function useAllPosts() {
  return useQuery({
    queryKey: ["posts"],
    queryFn: fetchAllPosts,
  });
}

export function useRecentPosts(count: number) {
  return useQuery({
    queryKey: ["posts", "recent", count],
    queryFn: async () => {
      const posts = await fetchAllPosts();
      return posts.slice(0, count);
    },
  });
}

export function usePostBySlug(slug: string) {
  return useQuery({
    queryKey: ["post", slug],
    queryFn: () => fetchPostBySlug(slug),
    enabled: !!slug,
  });
}

export { fetchAllPosts, fetchPostBySlug };
