import { defineHandler } from "void";
import { readActiveContentJson } from "@/content-store";
import { fixtures, isDevContent } from "@/server-content";

export const GET = defineHandler(async () => {
  if (isDevContent) return Response.json(fixtures.searchIndex);

  const result = await readActiveContentJson("search-index.json");
  if (result.status !== "ready") return Response.json({ documents: [] });
  return Response.json(result.value, {
    headers: { "cache-control": "public, max-age=60, stale-while-revalidate=300" },
  });
});
