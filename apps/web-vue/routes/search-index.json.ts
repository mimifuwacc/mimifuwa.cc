import { defineHandler } from "void";
import { getPublishedContent } from "./_content";

export const GET = defineHandler(async () => {
  return (
    (await getPublishedContent("search-index.json")) ??
    new Response("[]", {
      headers: { "Content-Type": "application/json; charset=utf-8" },
    })
  );
});
