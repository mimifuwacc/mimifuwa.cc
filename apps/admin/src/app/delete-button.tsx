"use client";

import { Button } from "@mimifuwacc/ui/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deletePost } from "@/lib/graphql/actions";

interface DeleteButtonProps {
  slug: string;
}

export function DeleteButton({ slug }: DeleteButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("この記事を削除しますか？")) {
      return;
    }

    setIsDeleting(true);

    const result = await deletePost(slug);

    if (result.success) {
      router.refresh();
    } else {
      alert(result.message);
      setIsDeleting(false);
    }
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      {isDeleting ? "削除中..." : "Delete"}
    </Button>
  );
}
