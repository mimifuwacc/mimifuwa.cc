import { Effect } from "effect";
import { Hono } from "hono";
import { cors } from "hono/cors";
import {
  archiveAdminPost,
  createAdminPost,
  deleteAdminPost,
  getAdminPost,
  listAdminPosts,
  type AdminPostInput,
  updateAdminPost,
} from "./admin-repository";
import type { ApiErrorBody } from "./contracts";
import { getOgImage } from "./og";
import { getOgp } from "./ogp";
import { getTwitterEmbed } from "./embed-cache";
import { getPost, listPosts, type Env } from "./repository";

const app = new Hono<{ Bindings: Env }>();

app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "x-admin-secret"],
  }),
);

app.use("/admin/*", async (context, next) => {
  if (context.req.header("x-admin-secret") !== context.env.API_ADMIN_SECRET) {
    return context.json({ error: "unauthorized", message: "Unauthorized" }, 401);
  }
  await next();
});

app.get("/health", (context) => context.json({ status: "ok" }));

app.get("/embeds/twitter/:id", async (context) => {
  const id = context.req.param("id");
  if (!/^\d{1,40}$/.test(id)) {
    return context.json({ error: "invalid_request", message: "Invalid tweet id" }, 400);
  }
  const result = await Effect.runPromise(
    Effect.either(getTwitterEmbed(context.env, context.executionCtx, id)),
  );
  if (result._tag === "Left") {
    console.error(`Unable to fetch tweet ${id}`, result.left);
    return context.json(
      { error: "upstream_unavailable", message: "Unable to load or cache this tweet" },
      502,
    );
  }
  return context.json(result.right.tweet, 200, {
    "cache-control": "public, max-age=300, s-maxage=3600",
    "x-embed-cache": result.right.cache,
  });
});

app.post("/upload/image", async (context) => {
  const file = (await context.req.formData()).get("file");
  const allowed = new Set(["image/jpeg", "image/png", "image/gif", "image/webp", "image/avif"]);
  if (!(file instanceof File)) return context.json({ error: "No file provided" }, 400);
  if (!allowed.has(file.type)) return context.json({ error: "Invalid file type" }, 400);
  if (file.size > 10 * 1024 * 1024) {
    return context.json({ error: "File too large (max 10MB)" }, 400);
  }
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const filename = `${Date.now()}-${crypto.randomUUID()}.${extension}`;
  await context.env.R2.put(`images/${filename}`, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type },
  });
  const base = context.env.API_BASE_URL ?? new URL(context.req.url).origin;
  return context.json({ url: `${base}/images/${filename}` });
});

app.get("/images/:path{.+}", async (context) => {
  const object = await context.env.R2.get(`images/${context.req.param("path")}`);
  if (!object) return context.json({ error: "not_found", message: "Image not found" }, 404);
  return new Response(object.body, {
    headers: {
      "content-type": object.httpMetadata?.contentType ?? "application/octet-stream",
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
});

app.get("/og/:slug{.+}", (context) => getOgImage(context.env, context.req.param("slug")));

app.get("/ogp", async (context) => {
  const url = context.req.query("url");
  if (!url) {
    return context.json({ error: "invalid_request", message: "url is required" }, 400);
  }
  const ogp = await getOgp(url);
  return ogp
    ? context.json(ogp, 200, { "cache-control": "public, max-age=3600, s-maxage=86400" })
    : context.json({ error: "invalid_request", message: "url must be a public HTTP URL" }, 400);
});
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

app.get("/admin/posts", async (context) => context.json(await listAdminPosts(context.env)));

app.get("/admin/posts/:slug{.+}", async (context) => {
  const post = await getAdminPost(context.env, context.req.param("slug"));
  return post
    ? context.json(post)
    : context.json({ error: "not_found", message: "Post not found" }, 404);
});

app.post("/admin/posts", async (context) => {
  const input = await readAdminInput(context.req.raw);
  if (!input) return context.json({ error: "invalid_request", message: "Invalid post" }, 400);
  try {
    return context.json(await createAdminPost(context.env, input), 201);
  } catch (error) {
    return context.json(
      {
        error: "invalid_request",
        message: error instanceof Error ? error.message : "Invalid post",
      },
      409,
    );
  }
});

app.put("/admin/posts/:slug{.+}", async (context) => {
  const input = await readAdminInput(context.req.raw);
  if (!input) return context.json({ error: "invalid_request", message: "Invalid post" }, 400);
  try {
    const post = await updateAdminPost(context.env, context.req.param("slug"), input);
    return post
      ? context.json(post)
      : context.json({ error: "not_found", message: "Post not found" }, 404);
  } catch (error) {
    return context.json(
      {
        error: "invalid_request",
        message: error instanceof Error ? error.message : "Invalid post",
      },
      409,
    );
  }
});

app.delete("/admin/posts/:slug{.+}", async (context) => {
  const deleted = await deleteAdminPost(context.env, context.req.param("slug"));
  return deleted
    ? context.json({ success: true, message: "Post deleted" })
    : context.json({ error: "not_found", message: "Post not found" }, 404);
});

app.post("/admin/posts/:slug{.+}/archive", async (context) => {
  const archived = await archiveAdminPost(context.env, context.req.param("slug"));
  return archived
    ? context.json({ success: true, message: "Post archived" })
    : context.json({ error: "not_found", message: "Post not found" }, 404);
});

const readAdminInput = async (request: Request): Promise<AdminPostInput | null> => {
  const value: unknown = await request.json().catch(() => null);
  if (!value || typeof value !== "object") return null;
  const input = value as Record<string, unknown>;
  if (
    typeof input.slug !== "string" ||
    typeof input.title !== "string" ||
    typeof input.excerpt !== "string" ||
    typeof input.markdown !== "string" ||
    typeof input.date !== "string" ||
    typeof input.draft !== "boolean" ||
    typeof input.isPublished !== "boolean" ||
    !Array.isArray(input.tags) ||
    !input.tags.every((tag) => typeof tag === "string")
  ) {
    return null;
  }
  return input as unknown as AdminPostInput;
};

export default app;
