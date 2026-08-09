import { Badge } from "@mimifuwacc/ui/components/ui/badge";
import { buttonVariants } from "@mimifuwacc/ui/components/ui/button-variants";
import { cn } from "@mimifuwacc/ui/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@mimifuwacc/ui/components/ui/table";
import { adminApi } from "@/lib/api/client";
import { DeleteButton } from "./delete-button";

async function getPosts() {
  try {
    return await adminApi.listPosts();
  } catch {
    return {
      posts: [],
      totalCount: 0,
    };
  }
}

export default async function HomePage() {
  const data = await getPosts();

  const { posts, totalCount } = data;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Posts</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{totalCount} 件</p>
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
                    <a
                      href={`/edit/${post.slug}`}
                      className="font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                      {post.title || (
                        <span className="text-muted-foreground italic">(タイトル未定)</span>
                      )}
                    </a>
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
                      <a
                        href={`/edit/${post.slug}`}
                        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                      >
                        Edit
                      </a>
                      <DeleteButton slug={post.slug} />
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
