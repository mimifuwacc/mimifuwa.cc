export interface PostSummary {
  title: string;
  description?: string;
  date?: string;
  tags?: string[];
  url: string;
}

export interface PostArticle extends PostSummary {
  html: string;
}
