/** A published post as exposed by the content API. Presentation artifacts are excluded. */
export interface BlogPost {
  readonly slug: string;
  readonly title: string;
  readonly excerpt: string;
  readonly markdown: string;
  readonly date: string;
  readonly tags: readonly string[];
}

/** List items intentionally omit the potentially large Markdown body. */
export type BlogPostSummary = Omit<BlogPost, "markdown">;

export interface BlogPostPage {
  readonly posts: readonly BlogPostSummary[];
  readonly totalCount: number;
}

export interface ApiErrorBody {
  readonly error: "not_found" | "invalid_request" | "internal_error";
  readonly message: string;
}
