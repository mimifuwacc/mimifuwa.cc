// BlogPost entity
export interface BlogPost {
  id: number;
  slug: string;
  r2Key: string;
  title: string;
  excerpt: string;
  content: string;
  date: Date;
  tags: Tag[];
  draft: boolean;
  contentHash: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Tag entity
export interface Tag {
  id: number;
  name: string;
}

// Filter options
export interface BlogPostFilter {
  draft?: boolean | null;
  tag?: string | null;
  search?: string | null;
  dateAfter?: Date | null;
  dateBefore?: Date | null;
}

// Pagination
export interface Pagination {
  first?: number;
  after?: string | null;
  limit: number;
  offset: number;
}

// Page info for connection
export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
  totalCount: number;
}

// Blog post edge for connection
export interface BlogPostEdge {
  node: BlogPost;
  cursor: string;
}

// Blog post connection
export interface BlogPostConnection {
  edges: BlogPostEdge[];
  pageInfo: PageInfo;
}

// Mutation response
export interface MutationResponse {
  success: boolean;
  message: string;
  blogPost?: BlogPost | null;
}

// Environment types
export interface Env {
  DB: D1Database;
  R2: R2Bucket;
  ENVIRONMENT?: string;
}

// Context for GraphQL resolvers
export interface Context {
  env: Env;
  request: Request;
}
