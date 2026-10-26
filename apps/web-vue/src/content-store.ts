import { env } from "void/env";
import { storage } from "void/storage";

const revisionPattern = /^[a-f0-9]{7,64}$/;
const revisionFiles = [
  "blogs/index.json",
  "blogs/content.json",
  "works/index.json",
  "works/content.json",
] as const;

type StoredContent = NonNullable<Awaited<ReturnType<typeof storage.get>>>;

export type ContentFileResult =
  | { status: "unpublished" }
  | { status: "missing" }
  | { status: "ready"; object: StoredContent };

export type ContentJsonResult<T> =
  | { status: "unpublished" }
  | { status: "missing" }
  | { status: "ready"; value: T };

export const isContentRevision = (value: unknown): value is string =>
  typeof value === "string" && revisionPattern.test(value);

export const isAuthorizedPublisher = (authorization: string | undefined) => {
  const token: unknown = env.CONTENT_PUBLISH_TOKEN;
  return typeof token === "string" && token.length > 0 && authorization === `Bearer ${token}`;
};

export const isPublishableContentPath = (path: string) =>
  path.length > 0 &&
  !path.split("/").some((part) => part === ".." || part === ".") &&
  (path === "search-index.json" ||
    path.startsWith("blogs/") ||
    path.startsWith("works/") ||
    /^assets\/ox-content-[a-zA-Z0-9._/-]+$/.test(path));

export const isOxContentAssetPath = (path: string) =>
  /^assets\/ox-content-[a-zA-Z0-9._/-]+$/.test(path) && !path.includes("..");

export const contentUrl = (section: "blogs" | "works", slug: string) =>
  `/${section}/${slug.replace(/^\/+|\/+$/g, "")}/`;

export const rewriteContentAssetUrls = (html: string) =>
  html.replace(/(["'(])\/assets\/(ox-content-[^"')\s]+)/g, "$1/api/content/assets/assets/$2");

const contentKey = (revision: string, path: string) => `content/revisions/${revision}/${path}`;

export async function readActiveContentFile(path: string): Promise<ContentFileResult> {
  const manifest = await storage.get("content/active-revision.json");
  if (!manifest) return { status: "unpublished" };

  const value: unknown = await manifest.json();
  const revision =
    value && typeof value === "object" && "revision" in value ? value.revision : undefined;
  if (!isContentRevision(revision)) return { status: "unpublished" };

  const object = await storage.get(contentKey(revision, path));
  return object ? { status: "ready", object } : { status: "missing" };
}

export async function readActiveContentJson<T>(path: string): Promise<ContentJsonResult<T>> {
  const result = await readActiveContentFile(path);
  if (result.status !== "ready") return result;
  return { status: "ready", value: (await result.object.json()) as T };
}

export async function uploadContentFile(
  revision: string,
  path: string,
  body: ArrayBuffer,
  contentType: string,
) {
  await storage.put(contentKey(revision, path), body, {
    httpMetadata: { contentType },
  });
}

export async function activateContentRevision(revision: string) {
  const files = await Promise.all(
    revisionFiles.map((path) => storage.head(contentKey(revision, path))),
  );
  if (files.some((file) => !file)) return false;

  await storage.put("content/active-revision.json", JSON.stringify({ revision }), {
    httpMetadata: { contentType: "application/json; charset=utf-8" },
  });
  return true;
}
