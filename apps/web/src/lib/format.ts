export const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export const postHref = (slug: string) => `/blogs/${slug}`;

export const postOgImage = (slug: string) =>
  `https://api.mimifuwa.cc/og/${slug.split("/").map(encodeURIComponent).join("/")}`;
