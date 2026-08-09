"use server";

import { adminApi } from "./client";
import type { PostInput } from "./types";

const inputFrom = (formData: FormData, fallbackSlug?: string): PostInput => ({
  slug:
    (formData.get("newSlug") as string | null) ||
    (formData.get("slug") as string) ||
    fallbackSlug ||
    "",
  title: (formData.get("title") as string) || "",
  excerpt: (formData.get("excerpt") as string) || "",
  markdown: (formData.get("content") as string) || "",
  date: new Date((formData.get("date") as string) || Date.now()).toISOString(),
  tags: ((formData.get("tags") as string) || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean),
  draft: formData.get("draft") === "true",
  isPublished: formData.get("isPublished") === "true",
});

const failure = (error: unknown) => ({
  success: false,
  message: error instanceof Error ? error.message : "API request failed",
});

export async function createPost(formData: FormData) {
  const input = inputFrom(formData);
  if (!input.slug || !input.date) return { success: false, message: "Slug と日付は必須です" };
  if (!input.draft && (!input.title || !input.excerpt || !input.markdown)) {
    return { success: false, message: "Required fields are missing" };
  }
  try {
    const post = await adminApi.createPost(input);
    return { success: true, message: "Post created", blogPost: post };
  } catch (error) {
    console.error("Failed to create post:", error);
    return failure(error);
  }
}

export async function updatePost(slug: string, formData: FormData) {
  const input = inputFrom(formData, slug);
  if (!input.draft && (!input.title || !input.excerpt || !input.markdown)) {
    return { success: false, message: "Required fields are missing" };
  }
  try {
    const post = await adminApi.updatePost(slug, input);
    return { success: true, message: "Post updated", blogPost: post };
  } catch (error) {
    console.error("Failed to update post:", error);
    return failure(error);
  }
}

export async function deletePost(slug: string) {
  try {
    return await adminApi.deletePost(slug);
  } catch (error) {
    console.error("Failed to delete post:", error);
    return failure(error);
  }
}

export async function checkSlugExists(slug: string): Promise<boolean> {
  try {
    await adminApi.getPost(slug);
    return true;
  } catch {
    return false;
  }
}

export async function archivePost(slug: string) {
  try {
    return await adminApi.archivePost(slug);
  } catch (error) {
    console.error("Failed to archive post:", error);
    return failure(error);
  }
}
