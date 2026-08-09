import type { ApiErrorBody } from "@mimifuwacc/blog-domain";
import { Effect } from "effect";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { getPost, listPosts, type Env } from "./repository";

const app = new Hono<{ Bindings: Env }>();

app.use("*", cors({ origin: "*", allowMethods: ["GET", "OPTIONS"] }));

app.get("/health", (context) => context.json({ status: "ok" }));

app.get("/posts", async (context) => {
  const rawLimit = Number(context.req.query("limit") ?? 20);
  if (!Number.isInteger(rawLimit) || rawLimit < 1 || rawLimit > 100) {
    return context.json<ApiErrorBody>(
      { error: "invalid_request", message: "limit must be an integer between 1 and 100" },
      400,
    );
  }

  const result = await Effect.runPromise(Effect.either(listPosts(context.env, rawLimit)));
  if (result._tag === "Left") {
    console.error(result.left);
    return context.json<ApiErrorBody>(
      { error: "internal_error", message: "Unable to load posts" },
      500,
    );
  }
  return context.json(result.right);
});

app.get("/posts/:slug{.+}", async (context) => {
  const slug = context.req.param("slug");
  const result = await Effect.runPromise(Effect.either(getPost(context.env, slug)));
  if (result._tag === "Left") {
    console.error(result.left);
    return context.json<ApiErrorBody>(
      { error: "internal_error", message: "Unable to load the post" },
      500,
    );
  }
  if (!result.right) {
    return context.json<ApiErrorBody>({ error: "not_found", message: "Post not found" }, 404);
  }
  return context.json(result.right);
});

export default app;
