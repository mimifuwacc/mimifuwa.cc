export interface BlogSummary {
  title: string;
  description?: string;
  date?: string;
  tags?: string[];
  url: string;
}

export interface BlogArticle extends BlogSummary {
  html: string;
}
