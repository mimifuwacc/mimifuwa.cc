import { defineHandler } from "void";
import { storage } from "void/storage";
import { contentRoot, isSafeContentPath } from "../../../_content";

export const POST = defineHandler(async (c) => {
  const token = c.env.CONTENT_PUBLISH_TOKEN;
  if (!token || c.req.header("authorization") !== `Bearer ${token}`) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const revision = c.req.header("x-content-revision") ?? "";
  const path = c.req.param("path");
  if (!/^[a-f0-9]{7,64}$/.test(revision) || !isSafeContentPath(path)) {
    return c.json({ error: "Invalid content path or revision" }, 400);
  }

  await storage.put(`${contentRoot}${revision}/${path}`, c.req.raw.body, {
    httpMetadata: { contentType: c.req.header("content-type") ?? "application/octet-stream" },
  });
  return c.json({ uploaded: path });
});
