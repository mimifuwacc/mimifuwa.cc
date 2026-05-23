import { notFound } from "next/navigation";
import { client } from "@/lib/graphql/client";
import { GET_POST } from "@/lib/graphql/queries";
import type { GetPostResponse } from "@/lib/graphql/types";
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
    const data = await client.request<GetPostResponse>(GET_POST, { slug });
    return data.adminPost;
  } catch {
    return null;
  }
}
