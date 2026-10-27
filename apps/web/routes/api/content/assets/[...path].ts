import { defineHandler } from "void";
import { isOxContentAssetPath, readActiveContentFile } from "@/content-store";

export const GET = defineHandler(async (c) => {
  const path = (c.req.param("path") ?? "").replace(/^\/+/, "");
  if (!isOxContentAssetPath(path)) return c.notFound();
  const result = await readActiveContentFile(path);
  if (result.status !== "ready") return c.notFound();
  const headers = new Headers();
  result.object.writeHttpMetadata(headers);
  headers.set("cache-control", "public, max-age=31536000, immutable");
  headers.set("x-content-type-options", "nosniff");
  return new Response(result.object.body, { headers });
});
