import { defineHandler } from "void";
import {
  isAuthorizedPublisher,
  isContentRevision,
  isPublishableContentPath,
  uploadContentFile,
} from "@/content-store";
import { isDevContent } from "@/server-content";

export const POST = defineHandler(async (c) => {
  if (isDevContent) return c.notFound();

  if (!isAuthorizedPublisher(c.req.header("Authorization"))) {
    return c.json({ error: "unauthorized" }, 401);
  }
  const revision = c.req.header("X-Content-Revision") ?? "";
  const path = (c.req.param("path") ?? "").replace(/^\/+/, "");
  if (!isContentRevision(revision) || !isPublishableContentPath(path)) {
    return c.json({ error: "invalid_request" }, 400);
  }

  await uploadContentFile(
    revision,
    path,
    await c.req.raw.arrayBuffer(),
    c.req.header("Content-Type") ?? "application/octet-stream",
  );
  return c.json({ uploaded: path });
});
