import { notFound } from "next/navigation";
import { adminApi } from "@/lib/api/client";
import { PostForm } from "./post-form";

export default async function EditPostPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const post = await getPost(slug.join("/"));

  if (!post) {
    notFound();
  }

  return <PostForm post={post} />;
}

async function getPost(slug: string) {
  try {
    return await adminApi.getPost(slug);
  } catch {
    return null;
  }
}
