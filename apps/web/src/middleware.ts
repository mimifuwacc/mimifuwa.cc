import { defineMiddleware } from "astro:middleware";

const browserTtl = 5 * 60;
const edgeTtl = 6 * 60 * 60;
const staleTtl = 24 * 60 * 60;

export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next();
  const contentType = response.headers.get("content-type") ?? "";

  if (
    (context.request.method === "GET" || context.request.method === "HEAD") &&
    response.status === 200 &&
    contentType.startsWith("text/html")
  ) {
    response.headers.set(
      "cache-control",
      `public, max-age=${browserTtl}, s-maxage=${edgeTtl}, stale-while-revalidate=${staleTtl}`,
    );
  }

  return response;
});
