declare module "virtual:ox-content/collections" {
  interface Entry {
    path: string;
    title: string;
    description?: string;
    frontmatter: Record<string, unknown>;
    html?: string;
  }

  export function getCollection(name: string): Entry[];
}
