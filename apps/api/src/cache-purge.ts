import type { Env } from "./repository";

const encodeSlug = (slug: string) => slug.split("/").map(encodeURIComponent).join("/");

const publicUrls = (env: Env, slugs: readonly string[]) => {
  const blogOrigin = env.BLOG_ORIGIN ?? "https://mimifuwa.cc";
  const apiOrigin = env.API_ORIGIN ?? "https://api.mimifuwa.cc";
  const urls = new Set([`${blogOrigin}/`, `${blogOrigin}/blogs`, `${apiOrigin}/posts`]);

  for (const slug of slugs) {
    const encoded = encodeSlug(slug);
    urls.add(`${blogOrigin}/blogs/${encoded}`);
    urls.add(`${apiOrigin}/posts/${encoded}`);
    urls.add(`${apiOrigin}/og/${encoded}`);
  }

  return [...urls];
};

export const purgePublicCache = async (env: Env, slugs: readonly string[]) => {
  if (!env.CACHE_PURGE_API_TOKEN || !env.CLOUDFLARE_ZONE_ID) return;

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${env.CLOUDFLARE_ZONE_ID}/purge_cache`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${env.CACHE_PURGE_API_TOKEN}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ files: publicUrls(env, slugs) }),
    },
  );

  if (!response.ok) {
    throw new Error(`Cloudflare cache purge failed (${response.status})`);
  }
};
