export async function purgeOgCache(r2: R2Bucket, slug: string): Promise<void> {
  await r2.delete(`og/${slug}.png`);
}
