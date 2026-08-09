export interface MutationResponse {
  success: boolean;
  message: string;
}

export interface Post {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  markdown: string;
  date: string;
  draft: boolean;
  isPublished: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PostPage {
  posts: Post[];
  totalCount: number;
}

export interface PostInput {
  slug: string;
  title: string;
  excerpt: string;
  markdown: string;
  date: string;
  draft: boolean;
  isPublished: boolean;
  tags: string[];
}
