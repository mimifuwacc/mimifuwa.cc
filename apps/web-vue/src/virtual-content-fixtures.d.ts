declare module "virtual:mimifuwa-content-fixtures" {
  import type { ArticlePage } from "./content-theme";

  const fixtures: {
    blogs: Pick<ArticlePage, "title" | "description" | "date" | "tags" | "url">[];
    blogContent: Pick<ArticlePage, "title" | "description" | "date" | "tags" | "url" | "html">[];
    works: Pick<ArticlePage, "title" | "description" | "url">[];
    workContent: Pick<ArticlePage, "title" | "description" | "url" | "html">[];
    searchIndex: {
      documents: { title: string; url: string; body: string }[];
    };
  };

  export default fixtures;
}
