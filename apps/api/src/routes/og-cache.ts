export async function purgeOgCache(origin: string, slug: string): Promise<void> {
  if (typeof caches === "undefined") return;
  await (caches as unknown as { default: Cache }).default.delete(`${origin}/og/${slug}`);
}
