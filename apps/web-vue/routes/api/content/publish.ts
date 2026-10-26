import { defineHandler } from "void";
import { activateContentRevision, isAuthorizedPublisher, isContentRevision } from "@/content-store";
import { isDevContent } from "@/server-content";

export const POST = defineHandler(async (c) => {
  if (isDevContent) return c.notFound();

  if (!isAuthorizedPublisher(c.req.header("Authorization"))) {
    return c.json({ error: "unauthorized" }, 401);
  }
  const body: unknown = await c.req.json().catch(() => null);
  const revision = body && typeof body === "object" && "revision" in body ? body.revision : null;
  if (!isContentRevision(revision)) return c.json({ error: "invalid_request" }, 400);

  if (!(await activateContentRevision(revision)))
    return c.json({ error: "incomplete_revision" }, 409);
  return c.json({ published: revision });
});
