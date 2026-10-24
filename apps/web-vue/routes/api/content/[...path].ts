import { defineHandler } from "void";
import { getPublishedContent, isSafeContentPath } from "../../_content";

export const GET = defineHandler(async (c) => {
  const path = c.req.param("path");
  if (!isSafeContentPath(path)) return c.notFound();
  return (await getPublishedContent(path)) ?? c.notFound();
});
