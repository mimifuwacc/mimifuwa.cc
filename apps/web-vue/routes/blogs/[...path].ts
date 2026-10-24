import { defineHandler } from "void";
import { getPublishedContent } from "../_content";

export const GET = defineHandler(async (c) => {
  const path = c.req.param("path");
  const normalizedPath =
    path === "" ? "index.html" : path.endsWith("/") ? `${path}index.html` : path;
  return (await getPublishedContent(`blogs/${normalizedPath}`)) ?? c.notFound();
});
