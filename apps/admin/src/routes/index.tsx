import { Badge } from "@mimifuwacc/ui/components/ui/badge";
import { Button } from "@mimifuwacc/ui/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@mimifuwacc/ui/components/ui/table";
import { cn } from "@mimifuwacc/ui/lib/utils";
import { Link, createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { deletePost, listPosts } from "../lib/server-functions";
import { buttonVariants } from "../lib/button-variants";

export const Route = createFileRoute("/")({ loader: () => listPosts(), component: HomePage });

function HomePage() {
  const { posts, totalCount } = Route.useLoaderData();
  const router = useRouter();
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Posts</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{totalCount} 件</p>
        </div>
        <Link to="/new" className={cn(buttonVariants())}>
          New Post
        </Link>
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
            {posts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-12">
                  投稿がありません
                </TableCell>
              </TableRow>
            ) : (
              posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <Link
                      to="/edit/$slug"
                      params={{ slug: post.slug }}
                      className="font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                      {post.title || (
                        <span className="text-muted-foreground italic">(タイトル未定)</span>
                      )}
                    </Link>
                    <p className="text-xs text-muted-foreground mt-0.5">{post.slug}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Badge variant={post.isPublished ? "default" : "outline"}>
                        {post.isPublished ? "公開中" : "非公開"}
                      </Badge>
                      {post.isPublished && post.draft && (
                        <Badge variant="secondary">差分あり</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {new Date(post.date).toLocaleDateString("ja-JP")}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to="/edit/$slug"
                        params={{ slug: post.slug }}
                        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                      >
                        Edit
                      </Link>
                      <DeleteButton slug={post.slug} onDeleted={() => router.invalidate()} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function DeleteButton({ slug, onDeleted }: { slug: string; onDeleted: () => void }) {
  const [isDeleting, setIsDeleting] = useState(false);
  return (
    <Button
      variant="destructive"
      size="sm"
      disabled={isDeleting}
      onPress={async () => {
        if (!confirm("この記事を削除しますか？")) return;
        setIsDeleting(true);
        try {
          await deletePost({ data: slug });
          onDeleted();
        } finally {
          setIsDeleting(false);
        }
      }}
    >
      {isDeleting ? "削除中..." : "Delete"}
    </Button>
  );
}
