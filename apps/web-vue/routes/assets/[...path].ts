import { defineHandler } from "void";
import { getPublishedContent } from "../_content";

export const GET = defineHandler(async (c) => {
  const path = c.req.param("path");
  if (!path.startsWith("ox-content-")) return c.notFound();
  return (await getPublishedContent(`assets/${path}`)) ?? c.notFound();
});
