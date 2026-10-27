import { storage } from "void/storage";

const revisionPattern = /^[a-f0-9]{7,64}$/;
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

export const isOxContentAssetPath = (path: string) =>
  /^assets\/ox-content-[a-zA-Z0-9._/-]+$/.test(path) && !path.includes("..");

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
