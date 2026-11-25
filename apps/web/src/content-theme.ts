export interface ArticlePage {
  title: string;
  navTitle: string;
  description?: string;
  date?: string;
  pinned?: boolean;
  tags?: string[];
  html: string;
  url: string;
  section: "posts" | "works";
  externalUrl?: string;
  technologies?: string[];
}
