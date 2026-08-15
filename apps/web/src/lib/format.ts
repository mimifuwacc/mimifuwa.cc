export const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export const postHref = (slug: string) => `/blogs/${slug}`;

export const postOgImage = (slug: string) => {
  const apiUrl = (
    import.meta.env.VITE_API_URL ??
    import.meta.env.API_URL ??
    (import.meta.env.DEV ? "http://localhost:8787" : "https://api.mimifuwa.cc")
  )
    .trim()
    .replace(/\/$/, "");
  return `${apiUrl}/og/${slug.split("/").map(encodeURIComponent).join("/")}`;
};
