"use client";

import { Button } from "@mimifuwacc/ui/components/ui/button";
import { ImageIcon } from "lucide-react";
import { useRef, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8787";

interface ImageUploadButtonProps {
  onInsert: (markdown: string) => void;
}

export function ImageUploadButton({ onInsert }: ImageUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${API_BASE}/upload/image`, { method: "POST", body: fd });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Upload failed" }));
        throw new Error((err as { error?: string }).error ?? "Upload failed");
      }
      const { url } = (await res.json()) as { url: string };
      const alt = file.name.replace(/\.[^.]+$/, "");
      onInsert(`![${alt}](${url})`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={uploading}
        onPress={() => inputRef.current?.click()}
      >
        <ImageIcon className="size-3.5" />
        {uploading ? "アップロード中..." : "画像"}
      </Button>
    </>
  );
}
