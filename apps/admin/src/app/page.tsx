import { Badge } from "@mimifuwacc/ui/components/ui/badge";
import { buttonVariants } from "@mimifuwacc/ui/components/ui/button";
import { cn } from "@mimifuwacc/ui/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@mimifuwacc/ui/components/ui/table";
import { client } from "@/lib/graphql/client";
import { GET_POSTS } from "@/lib/graphql/queries";
import type { GetPostsResponse } from "@/lib/graphql/types";
import { DeleteButton } from "./delete-button";

async function getPosts() {
  try {
    const data = await client.request<GetPostsResponse>(GET_POSTS, {
      filter: null,
      page: { first: 50 },
    });
    return data;
  } catch {
    return {
      adminBlogPosts: {
        edges: [],
        pageInfo: {
          totalCount: 0,
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: null,
          endCursor: null,
        },
      },
    };
  }
}

export default async function HomePage() {
  const data = await getPosts();

  const { edges, pageInfo } = data.adminBlogPosts;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Posts</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{pageInfo.totalCount} 件</p>
        </div>
        <a href="/new" className={cn(buttonVariants())}>
          New Post
        </a>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {edges.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-12">
                  投稿がありません
                </TableCell>
              </TableRow>
            ) : (
              edges.map(
                (edge: {
                  node: {
                    id: string;
                    slug: string;
                    title: string;
                    draft: boolean;
                    isPublished: boolean;
                    date: string;
                    tags: Array<{ id: string; name: string }>;
                  };
                }) => (
                  <TableRow key={edge.node.id}>
                    <TableCell>
                      <a
                        href={`/edit/${edge.node.slug}`}
                        className="font-medium text-primary hover:text-primary/80 transition-colors"
                      >
                        {edge.node.title || (
                          <span className="text-muted-foreground italic">(タイトル未定)</span>
                        )}
                      </a>
                      <p className="text-xs text-muted-foreground mt-0.5">{edge.node.slug}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Badge variant={edge.node.isPublished ? "default" : "outline"}>
                          {edge.node.isPublished ? "公開中" : "非公開"}
                        </Badge>
                        {edge.node.isPublished && edge.node.draft && (
                          <Badge variant="secondary">差分あり</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(edge.node.date).toLocaleDateString("ja-JP")}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {edge.node.tags.map((tag) => (
                          <Badge key={tag.id} variant="secondary">
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`/edit/${edge.node.slug}`}
                          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                        >
                          Edit
                        </a>
                        <DeleteButton slug={edge.node.slug} />
                      </div>
                    </TableCell>
                  </TableRow>
                ),
              )
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
