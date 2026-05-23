export interface MutationResponse {
  success: boolean;
  message: string;
  blogPost?: { id: string; slug: string; title: string };
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  markdown: string;
  date: string;
  draft: boolean;
  isPublished: boolean;
  tags: Array<{ id: string; name: string }>;
  createdAt: string;
  updatedAt: string;
}

export interface PostSummary {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  draft: boolean;
  isPublished: boolean;
  tags: Array<{ id: string; name: string }>;
  createdAt: string;
}

export interface BlogPostConnection {
  edges: Array<{ node: PostSummary; cursor: string }>;
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: string | null;
    endCursor: string | null;
    totalCount: number;
  };
}

export interface CreatePostResponse {
  createBlogPost: MutationResponse;
}
export interface UpdatePostResponse {
  updateBlogPost: MutationResponse;
}
export interface DeletePostResponse {
  deleteBlogPost: Pick<MutationResponse, "success" | "message">;
}
export interface ArchivePostResponse {
  archiveBlogPost: Pick<MutationResponse, "success" | "message">;
}
export interface GetPostResponse {
  adminPost: Post | null;
}
export interface GetPostsResponse {
  adminBlogPosts: BlogPostConnection;
}
