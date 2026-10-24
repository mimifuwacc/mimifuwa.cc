import { defineHandler } from "void";
import { storage } from "void/storage";
import { contentRoot } from "../../_content";

export const POST = defineHandler(async (c) => {
  const token = c.env.CONTENT_PUBLISH_TOKEN;
  if (!token || c.req.header("authorization") !== `Bearer ${token}`) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const body = await c.req.json<{ revision: string }>();
  if (!/^[a-f0-9]{7,64}$/.test(body.revision)) {
    return c.json({ error: "Invalid revision" }, 400);
  }

  await storage.put(`${contentRoot}current.json`, JSON.stringify({ revision: body.revision }), {
    httpMetadata: { contentType: "application/json; charset=utf-8" },
  });
  return c.json({ published: body.revision });
});
