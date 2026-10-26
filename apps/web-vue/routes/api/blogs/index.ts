import { defineHandler } from "void";
import { readActiveContentJson } from "@/content-store";
import { fixtures, isDevContent } from "@/server-content";

export const GET = defineHandler(async (c) => {
  if (isDevContent) return c.json(fixtures.blogs);

  const result = await readActiveContentJson("blogs/index.json");
  if (result.status === "unpublished") return c.json([], 200, { "cache-control": "no-store" });
  if (result.status === "missing") return c.json({ error: "content_unavailable" }, 503);
  return c.json(result.value, 200, {
    "cache-control": "public, max-age=60, stale-while-revalidate=300",
  });
});
