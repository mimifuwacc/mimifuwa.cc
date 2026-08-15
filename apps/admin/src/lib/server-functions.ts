import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { adminApi } from "./api/client";
import type { PostInput } from "./api/types";

export const listPosts = createServerFn({ method: "GET" }).handler(() => adminApi.listPosts());

export const getPost = createServerFn({ method: "GET" })
  .inputValidator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    try {
      return await adminApi.getPost(slug);
    } catch {
      throw notFound();
    }
  });

export const createPost = createServerFn({ method: "POST" })
  .inputValidator((input: PostInput) => input)
  .handler(({ data }) => adminApi.createPost(data));

export const updatePost = createServerFn({ method: "POST" })
  .inputValidator((data: { slug: string; input: PostInput }) => data)
  .handler(({ data }) => adminApi.updatePost(data.slug, data.input));

export const deletePost = createServerFn({ method: "POST" })
  .inputValidator((slug: string) => slug)
  .handler(({ data: slug }) => adminApi.deletePost(slug));

export const checkSlugExists = createServerFn({ method: "GET" })
  .inputValidator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    try {
      await adminApi.getPost(slug);
      return true;
    } catch {
      return false;
    }
  });
