import type { WorkItem } from "@/types/work";

let worksRequest: Promise<WorkItem[]> | undefined;
const workRequests = new Map<string, Promise<WorkItem | null>>();

export const getWorks = () => {
  worksRequest ??= fetch("/api/works")
    .then(async (response) => {
      if (!response.ok) throw new Error("制作物を読み込めませんでした。");
      return (await response.json()) as WorkItem[];
    })
    .catch((error: unknown) => {
      worksRequest = undefined;
      throw error;
    });
  return worksRequest;
};

export const getWork = (path: string) => {
  const normalized = `${path.replace(/^\/+|\/+$/g, "")}/`;
  const existing = workRequests.get(normalized);
  if (existing) return existing;

  const slug = normalized.replace(/^works\//, "").replace(/\/$/, "");
  const request = fetch(`/api/works/${slug.split("/").map(encodeURIComponent).join("/")}`)
    .then(async (response) => {
      if (response.status === 404) return null;
      if (!response.ok) throw new Error("制作物を読み込めませんでした。");
      return (await response.json()) as WorkItem;
    })
    .catch((error: unknown) => {
      workRequests.delete(normalized);
      throw error;
    });
  workRequests.set(normalized, request);
  return request;
};
