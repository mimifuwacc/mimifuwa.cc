"use server";

import { client } from "./client";
import { ARCHIVE_POST, CREATE_POST, DELETE_POST, UPDATE_POST } from "./queries";

export async function createPost(formData: FormData) {
  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const excerpt = formData.get("excerpt") as string;
  const content = formData.get("content") as string;
  const tags = formData.get("tags") as string;
  const date = formData.get("date") as string;
  const draft = formData.get("draft") === "true";
  const isPublished = formData.get("isPublished") === "true";

  if (!title || !slug || !excerpt || !content || !date) {
    return { success: false, message: "Required fields are missing" };
  }

  try {
    const data = await client.request(CREATE_POST, {
      input: {
        slug,
        title,
        excerpt,
        content,
        date: new Date(date).toISOString(),
        tags: tags ? tags.split(",").map((t) => t.trim()) : [],
        draft,
        isPublished,
      },
    });

    return data.createBlogPost;
  } catch (error) {
    console.error("Failed to create post:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to create post",
    };
  }
}

export async function updatePost(slug: string, formData: FormData) {
  const title = formData.get("title") as string;
  const newSlug = formData.get("newSlug") as string | null;
  const excerpt = formData.get("excerpt") as string;
  const content = formData.get("content") as string;
  const tags = formData.get("tags") as string;
  const draft = formData.get("draft") === "true";
  const isPublishedRaw = formData.get("isPublished");
  const isPublished = isPublishedRaw !== null ? isPublishedRaw === "true" : undefined;

  if (!title || !excerpt || !content) {
    return { success: false, message: "Required fields are missing" };
  }

  try {
    const data = await client.request(UPDATE_POST, {
      input: {
        slug,
        ...(newSlug && newSlug !== slug ? { newSlug } : {}),
        title,
        excerpt,
        content,
        tags: tags ? tags.split(",").map((t) => t.trim()) : [],
        draft,
        ...(isPublished !== undefined ? { isPublished } : {}),
      },
    });

    return data.updateBlogPost;
  } catch (error) {
    console.error("Failed to update post:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update post",
    };
  }
}

export async function deletePost(slug: string) {
  try {
    const data = await client.request(DELETE_POST, { slug });
    return data.deleteBlogPost;
  } catch (error) {
    console.error("Failed to delete post:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete post",
    };
  }
}

export async function archivePost(slug: string) {
  try {
    const data = await client.request(ARCHIVE_POST, { slug });
    return data.archiveBlogPost;
  } catch (error) {
    console.error("Failed to archive post:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to archive post",
    };
  }
}
