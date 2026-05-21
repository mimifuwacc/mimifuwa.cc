export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/<[^>]*>/g, "") // strip HTML tags
    .replace(/[^\w\s぀-ヿ一-鿿]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function extractHeadings(html: string): { id: string; text: string; level: number }[] {
  const matches = [...html.matchAll(/<h([2-3])[^>]*>(.*?)<\/h[2-3]>/gi)];
  return matches.map((match) => {
    const text = match[2].replace(/<[^>]*>/g, "");
    return { level: Number(match[1]), text, id: slugify(text) };
  });
}
