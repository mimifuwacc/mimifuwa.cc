export interface ArticlePage {
  title: string;
  navTitle: string;
  description?: string;
  date?: string;
  tags?: string[];
  html: string;
  url: string;
  section: "blogs" | "works";
  externalUrl?: string;
  technologies?: string[];
}

export const markdownToText = (html: string) =>
  html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
