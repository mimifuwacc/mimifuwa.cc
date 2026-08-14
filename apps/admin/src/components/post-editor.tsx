"use client";

import { Alert, AlertDescription } from "@mimifuwacc/ui/components/ui/alert";
import { Button } from "@mimifuwacc/ui/components/ui/button";
import { buttonVariants } from "@mimifuwacc/ui/components/ui/button-variants";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@mimifuwacc/ui/components/ui/dialog";
import { cn } from "@mimifuwacc/ui/lib/utils";
import {
  Bold,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  Code,
  Columns2,
  Eye,
  Heading2,
  Italic,
  Link,
  Minus,
  MoreHorizontal,
  PenLine,
  Quote,
  SquareCode,
  Strikethrough,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { checkSlugExists } from "@/lib/api/actions";
import {
  AUTOSAVE_IDLE_MS,
  AUTOSAVE_SAVED_RESET_MS,
  PREVIEW_DEBOUNCE_MS,
  SLUG_CHECK_DEBOUNCE_MS,
  SNAPSHOT_DEBOUNCE_MS,
  UNDO_STACK_LIMIT,
} from "@/lib/constants";
import { ImageUploadButton } from "./image-upload-button";
import { MarkdownPreview } from "./markdown-preview";
import { useDebounce } from "./use-debounce";

export interface PostEditorData {
  title: string;
  slug?: string;
  excerpt: string;
  content: string;
  tags: string;
  date?: string;
  draft: boolean; // true = 下書き中（MD のみ保存）
  isPublished: boolean; // true = 公開中（公開側に表示される）
}

interface PostEditorProps {
  mode: "new" | "edit";
  initialTitle?: string;
  initialSlug?: string;
  initialExcerpt?: string;
  initialContent?: string;
  initialTags?: string;
  initialDate?: string;
  initialDraft?: boolean;
  initialIsPublished?: boolean;
  slug?: string;
  onSave: (data: PostEditorData) => Promise<{ success: boolean; message?: string }>;
  onDelete?: () => Promise<{ success: boolean; message?: string }>;
}

type ViewMode = "edit" | "split" | "preview";

type FormatResult = { value: string; selStart: number; selEnd: number };

function applyFormat(
  el: HTMLTextAreaElement,
  type: "wrap" | "linePrefix",
  before: string,
  after?: string,
  defaultText?: string,
): FormatResult {
  const start = el.selectionStart;
  const end = el.selectionEnd;
  const selected = el.value.slice(start, end) || defaultText || "";

  if (type === "wrap") {
    const suffix = after ?? before;
    const next = el.value.slice(0, start) + before + selected + suffix + el.value.slice(end);
    return {
      value: next,
      selStart: start + before.length,
      selEnd: start + before.length + selected.length,
    };
  } else {
    const lineStart = el.value.lastIndexOf("\n", start - 1) + 1;
    const next = el.value.slice(0, lineStart) + before + el.value.slice(lineStart);
    return {
      value: next,
      selStart: start + before.length,
      selEnd: end + before.length,
    };
  }
}

export function PostEditor({
  mode,
  initialTitle = "",
  initialSlug = "",
  initialExcerpt = "",
  initialContent = "",
  initialTags = "",
  initialDate = "",
  initialDraft = true,
  initialIsPublished = false,
  slug,
  onSave,
  onDelete,
}: PostEditorProps) {
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [publishConfirm, setPublishConfirm] = useState(false);
  const [unpublishConfirm, setUnpublishConfirm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("split");

  // 自動保存
  const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedHash = useRef(
    JSON.stringify({
      title: initialTitle,
      slug: initialSlug,
      excerpt: initialExcerpt,
      tags: initialTags,
      content: initialContent,
    }),
  );

  function getCurrentHash(data: typeof formData) {
    return JSON.stringify({
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      tags: data.tags,
      content: contentRef.current?.value ?? "",
    });
  }

  function scheduleAutoSave(data: typeof formData) {
    if (!data.draft) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(async () => {
      const hash = getCurrentHash(data);
      if (hash === lastSavedHash.current) return;
      setAutoSaveStatus("saving");
      const result = await onSave({
        ...data,
        content: contentRef.current?.value ?? "",
        draft: true,
      });
      if (result.success) {
        lastSavedHash.current = hash;
        setLastSavedAt(new Date());
        setAutoSaveStatus("saved");
        setTimeout(() => setAutoSaveStatus("idle"), AUTOSAVE_SAVED_RESET_MS);
      } else {
        setAutoSaveStatus("error");
      }
    }, AUTOSAVE_IDLE_MS);
  }

  const [formData, setFormData] = useState({
    title: initialTitle,
    slug: initialSlug,
    excerpt: initialExcerpt,
    tags: initialTags,
    date: initialDate,
    draft: initialDraft,
    isPublished: initialIsPublished,
  });

  // content は uncontrolled で管理（チャンク undo/redo を自前で実装）
  const [previewContent, setPreviewContent] = useState(initialContent);
  const debouncedContent = useDebounce(previewContent, PREVIEW_DEBOUNCE_MS);

  // undo/redo スタック
  type Snapshot = { value: string; selStart: number; selEnd: number };
  const undoStack = useRef<Snapshot[]>([{ value: initialContent, selStart: 0, selEnd: 0 }]);
  const undoIndex = useRef(0);
  const snapshotTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function saveSnapshot() {
    const el = contentRef.current;
    if (!el) return;
    const snap: Snapshot = {
      value: el.value,
      selStart: el.selectionStart,
      selEnd: el.selectionEnd,
    };
    if (snap.value === undoStack.current[undoIndex.current]?.value) return;
    undoStack.current = undoStack.current.slice(0, undoIndex.current + 1);
    undoStack.current.push(snap);
    undoIndex.current = undoStack.current.length - 1;
    if (undoStack.current.length > UNDO_STACK_LIMIT) {
      undoStack.current.shift();
      undoIndex.current--;
    }
  }

  function flushAndSave() {
    if (snapshotTimer.current) {
      clearTimeout(snapshotTimer.current);
      snapshotTimer.current = null;
    }
    saveSnapshot();
  }

  function applySnapshot(snap: Snapshot) {
    const el = contentRef.current;
    if (!el) return;
    el.value = snap.value;
    el.setSelectionRange(
      Math.min(snap.selStart, snap.value.length),
      Math.min(snap.selEnd, snap.value.length),
    );
    setPreviewContent(snap.value);
  }

  function handleUndo() {
    flushAndSave();
    if (undoIndex.current > 0) {
      undoIndex.current--;
      applySnapshot(undoStack.current[undoIndex.current]);
    }
  }

  function handleRedo() {
    if (undoIndex.current < undoStack.current.length - 1) {
      undoIndex.current++;
      applySnapshot(undoStack.current[undoIndex.current]);
    }
  }

  const updateField = (field: keyof typeof formData, value: string | boolean) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      scheduleAutoSave(next);
      return next;
    });
  };

  // 保存（content は ref から直接読む）
  // asDraft: true = MD のみ, false = MD+HTML
  // publishedOverride: 指定時は isPublished を上書き
  async function handleSave(asDraft: boolean, publishedOverride?: boolean) {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    setIsSaving(true);
    setError(null);
    const nextIsPublished = publishedOverride ?? formData.isPublished;
    const nextDraft = publishedOverride === true ? false : asDraft; // 公開時は draft=false
    const data: PostEditorData = {
      ...formData,
      content: contentRef.current?.value ?? "",
      draft: nextDraft,
      isPublished: nextIsPublished,
    };
    const result = await onSave(data);
    if (result.success) {
      setFormData((prev) => ({ ...prev, draft: nextDraft, isPublished: nextIsPublished }));
      lastSavedHash.current = getCurrentHash({
        ...formData,
        draft: nextDraft,
        isPublished: nextIsPublished,
      });
      setLastSavedAt(new Date());
      setAutoSaveStatus("idle");
      if (nextIsPublished && !asDraft) {
        toast.success(nextIsPublished && formData.isPublished ? "更新しました" : "公開しました");
      }
    } else {
      setError(result.message ?? "保存に失敗しました");
      toast.error(result.message ?? "保存に失敗しました");
    }
    setIsSaving(false);
  }

  // 削除
  async function handleDelete() {
    if (!onDelete) return;
    const result = await onDelete();
    if (!result.success) setError(result.message ?? "削除に失敗しました");
  }

  // 整形ボタン（操作前後にスナップショットを保存）
  const handleFormat = useCallback(
    (type: "wrap" | "linePrefix", before: string, after?: string, defaultText?: string) => {
      const el = contentRef.current;
      if (!el) return;
      flushAndSave(); // 操作前スナップショット
      const r = applyFormat(el, type, before, after, defaultText);
      el.value = r.value;
      el.setSelectionRange(r.selStart, r.selEnd);
      el.focus();
      setPreviewContent(r.value);
      saveSnapshot(); // 操作後スナップショット
    },
    [],
  );

  // 画像挿入（ImageUploadButton 用）
  const insertAtCursor = useCallback((text: string) => {
    const el = contentRef.current;
    if (!el) return;
    flushAndSave();
    const start = el.selectionStart;
    const next = el.value.slice(0, start) + text + el.value.slice(el.selectionEnd);
    el.value = next;
    el.setSelectionRange(start + text.length, start + text.length);
    el.focus();
    setPreviewContent(next);
    saveSnapshot();
  }, []);

  // click-outside でメニューを閉じる
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // 新規作成時はメタデータを最初から開いておく（props から導出するので effect は不要）
  const [metaExpanded, setMetaExpanded] = useState(mode === "new");
  const [slugError, setSlugError] = useState<string | null>(null);
  const debouncedSlug = useDebounce(formData.slug, SLUG_CHECK_DEBOUNCE_MS);

  useEffect(() => {
    if (!debouncedSlug || debouncedSlug === initialSlug) {
      setSlugError(null);
      return;
    }
    let active = true;
    void checkSlugExists(debouncedSlug).then((exists) => {
      // 古いチェック結果は反映しない
      if (active) setSlugError(exists ? "このslugは既に使われています" : null);
    });
    return () => {
      active = false;
    };
  }, [debouncedSlug, initialSlug]);

  // タグチップ管理
  const [tagInput, setTagInput] = useState("");
  const tags = formData.tags
    ? formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  function addTag(value: string) {
    const t = value.trim().replace(/,/g, "");
    if (!t || tags.includes(t)) {
      setTagInput("");
      return;
    }
    updateField("tags", [...tags, t].join(", "));
    setTagInput("");
  }
  function removeTag(tag: string) {
    updateField("tags", tags.filter((t) => t !== tag).join(", "));
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* 上部ナビバー */}
      <div className="shrink-0 border-b flex items-center gap-2 px-3 py-2 bg-background">
        <a
          href="/"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "gap-1 text-muted-foreground shrink-0",
          )}
        >
          <ChevronLeft className="size-3.5" />
          一覧
        </a>

        <div className="flex-1" />

        {/* 自動保存ステータス */}
        <span className="text-xs shrink-0">
          {autoSaveStatus === "saving" && (
            <span className="flex items-center gap-1 text-muted-foreground/60">
              <span className="size-1.5 rounded-full bg-primary/60 animate-pulse inline-block" />
              保存中...
            </span>
          )}
          {autoSaveStatus === "saved" && lastSavedAt && (
            <span className="text-emerald-600">
              {lastSavedAt.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}{" "}
              に自動保存
            </span>
          )}
          {autoSaveStatus === "error" && <span className="text-destructive">自動保存に失敗</span>}
        </span>

        {/* 状態バッジ */}
        <div className="flex items-center gap-1 shrink-0">
          {formData.isPublished ? (
            <>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium border bg-emerald-50 text-emerald-700 border-emerald-200">
                公開中
              </span>
              {formData.draft && (
                <span className="text-xs px-2 py-0.5 rounded-full font-medium border bg-amber-50 text-amber-700 border-amber-200">
                  差分あり
                </span>
              )}
            </>
          ) : (
            <span className="text-xs px-2 py-0.5 rounded-full font-medium border bg-muted text-muted-foreground border-border">
              下書き
            </span>
          )}
        </div>

        <div className="w-px h-4 bg-border shrink-0" />

        {/* 保存（常に MD のみ・下書き保存） */}
        <Button
          type="button"
          size="sm"
          variant="outline"
          onPress={() => handleSave(true)}
          disabled={isSaving}
        >
          下書きを保存
        </Button>

        {/* 主要アクション */}
        <Button
          type="button"
          size="sm"
          onPress={() => setPublishConfirm(true)}
          isDisabled={isSaving}
        >
          {formData.isPublished ? "更新" : "公開する"}
        </Button>
        <Dialog isOpen={publishConfirm} onOpenChange={setPublishConfirm}>
          <DialogHeader>
            <DialogTitle>
              {formData.isPublished ? "記事を更新しますか？" : "記事を公開しますか？"}
            </DialogTitle>
            <DialogDescription>
              {formData.isPublished
                ? "公開中の記事が最新の内容に更新されます。"
                : "公開すると誰でも閲覧できるようになります。"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose type="button" variant="outline" size="sm">
              キャンセル
            </DialogClose>
            <Button
              type="button"
              size="sm"
              onPress={() => {
                setPublishConfirm(false);
                void handleSave(false, true);
              }}
            >
              {formData.isPublished ? "更新する" : "公開する"}
            </Button>
          </DialogFooter>
        </Dialog>

        {/* サブアクション（⋯ メニュー） */}
        <div className="relative shrink-0" ref={menuRef}>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="px-2"
            onPress={() => setMenuOpen((v) => !v)}
          >
            <MoreHorizontal className="size-4" />
          </Button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 z-50 min-w-36 rounded-lg border border-border bg-background shadow-md py-1">
              {formData.isPublished && (
                <button
                  type="button"
                  className="w-full text-left text-sm px-3 py-1.5 hover:bg-muted transition-colors text-muted-foreground"
                  onClick={() => {
                    setMenuOpen(false);
                    setUnpublishConfirm(true);
                  }}
                >
                  非公開にする
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  className="w-full text-left text-sm px-3 py-1.5 hover:bg-destructive/10 transition-colors text-destructive"
                  onClick={() => {
                    setMenuOpen(false);
                    setDeleteConfirm(true);
                  }}
                >
                  削除
                </button>
              )}
            </div>
          )}
        </div>

        {/* 非公開確認ダイアログ */}
        <Dialog isOpen={unpublishConfirm} onOpenChange={setUnpublishConfirm}>
          <DialogHeader>
            <DialogTitle>非公開にしますか？</DialogTitle>
            <DialogDescription>公開を停止します。記事の内容は削除されません。</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose type="button" variant="outline" size="sm">
              キャンセル
            </DialogClose>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onPress={() => {
                setUnpublishConfirm(false);
                void handleSave(formData.draft, false);
              }}
            >
              非公開にする
            </Button>
          </DialogFooter>
        </Dialog>

        {/* 削除確認ダイアログ */}
        <Dialog isOpen={deleteConfirm} onOpenChange={setDeleteConfirm}>
          <DialogHeader>
            <DialogTitle>記事を削除しますか？</DialogTitle>
            <DialogDescription>この操作は元に戻せません。</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose type="button" variant="outline" size="sm">
              キャンセル
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onPress={() => {
                setDeleteConfirm(false);
                void handleDelete();
              }}
            >
              削除する
            </Button>
          </DialogFooter>
        </Dialog>
      </div>

      {/* エラー */}
      {error && (
        <Alert variant="destructive" className="shrink-0 rounded-none border-x-0 border-t-0">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* メタデータ */}
      <div className="shrink-0 border-b bg-background">
        {/* 常時表示：タイトル + サマリー行 */}
        <div className="px-6 pt-3 pb-2">
          <input
            value={formData.title}
            onChange={(e) => updateField("title", e.target.value)}
            placeholder="記事のタイトルを入力..."
            className="text-[1.5rem] font-bold w-full bg-transparent border-none outline-none focus:outline-none placeholder:text-muted-foreground/20 leading-tight"
          />

          {/* サマリー行（クリックで展開） */}
          <button
            type="button"
            onClick={() => setMetaExpanded((v) => !v)}
            className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-full text-left"
          >
            <span className="font-mono">{formData.slug ?? slug ?? "slug"}</span>
            {tags.length > 0 && (
              <>
                <span className="opacity-30">·</span>
                {tags.map((t) => (
                  <span
                    key={t}
                    className="bg-primary/10 text-primary px-1.5 py-px rounded-full text-[10px] font-medium"
                  >
                    {t}
                  </span>
                ))}
              </>
            )}
            {formData.excerpt && (
              <>
                <span className="opacity-30">·</span>
                <span className="truncate max-w-sm opacity-60 italic">{formData.excerpt}</span>
              </>
            )}
            <ChevronDown
              className={cn(
                "size-3 shrink-0 ml-auto transition-transform",
                metaExpanded && "rotate-180",
              )}
            />
          </button>
        </div>

        {/* 展開時のフォーム */}
        {metaExpanded && (
          <div className="border-t border-border/50 bg-muted/20 px-6 py-4">
            <div className="grid gap-3 max-w-2xl">
              {/* Slug */}
              <div className="grid grid-cols-[5rem_1fr] items-start gap-3">
                <label className="text-xs font-medium text-muted-foreground text-right pt-1.5">
                  Slug
                </label>
                <div className="flex flex-col gap-1">
                  <div
                    className={cn(
                      "flex items-center gap-1.5 text-xs font-mono bg-background border rounded-md px-2.5 py-1.5 text-foreground focus-within:ring-2 focus-within:ring-ring/50 transition-colors",
                      slugError
                        ? "border-destructive focus-within:border-destructive focus-within:ring-destructive/50"
                        : "border-border focus-within:border-ring",
                    )}
                  >
                    <span className="text-muted-foreground/50">/</span>
                    <input
                      value={formData.slug ?? slug ?? ""}
                      onChange={(e) => updateField("slug", e.target.value)}
                      placeholder="my-post-slug"
                      className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground/40 font-mono min-w-0"
                    />
                  </div>
                  {slugError && <p className="text-xs text-destructive">{slugError}</p>}
                </div>
              </div>

              {/* タグ */}
              <div className="grid grid-cols-[5rem_1fr] items-start gap-3">
                <label className="text-xs font-medium text-muted-foreground text-right pt-1.5">
                  タグ
                </label>
                <div className="flex items-center gap-1 flex-wrap min-h-[2.25rem] bg-background border border-border rounded-md px-2.5 py-1 focus-within:ring-2 focus-within:ring-ring/50 focus-within:border-ring transition-colors">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-0.5 bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full font-medium"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-primary/60 transition-colors ml-0.5"
                      >
                        <X className="size-2.5" />
                      </button>
                    </span>
                  ))}
                  <input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();
                        addTag(tagInput);
                      }
                      if (e.key === "Backspace" && !tagInput && tags.length > 0)
                        removeTag(tags[tags.length - 1]);
                    }}
                    onBlur={() => {
                      if (tagInput) addTag(tagInput);
                    }}
                    placeholder={tags.length === 0 ? "Enter で確定" : "追加..."}
                    className="text-xs outline-none bg-transparent text-foreground placeholder:text-muted-foreground/40 min-w-[5rem]"
                  />
                </div>
              </div>

              {/* date */}
              <div className="grid grid-cols-[5rem_1fr] items-center gap-3">
                <label className="text-xs font-medium text-muted-foreground text-right">
                  投稿日
                </label>
                <div className="flex items-center gap-1.5 bg-background border border-border rounded-md px-2.5 py-1.5 text-xs text-foreground focus-within:ring-2 focus-within:ring-ring/50 focus-within:border-ring transition-colors">
                  <CalendarDays className="size-3 text-muted-foreground/50 shrink-0" />
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => updateField("date", e.target.value)}
                    className="flex-1 bg-transparent outline-none text-xs"
                  />
                </div>
              </div>

              {/* 概要 */}
              <div className="grid grid-cols-[5rem_1fr] items-center gap-3">
                <label className="text-xs font-medium text-muted-foreground text-right">概要</label>
                <div className="bg-background border border-border rounded-md px-2.5 py-1.5 focus-within:ring-2 focus-within:ring-ring/50 focus-within:border-ring transition-colors">
                  <input
                    value={formData.excerpt}
                    onChange={(e) => updateField("excerpt", e.target.value)}
                    placeholder="この記事の概要を一行で..."
                    className="w-full text-xs text-foreground bg-transparent outline-none placeholder:text-muted-foreground/40"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 整形ツールバー */}
      <div className="shrink-0 border-b flex items-center gap-0.5 px-2 py-1 bg-muted/30">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          title="Heading (##)"
          onPress={() => handleFormat("linePrefix", "## ")}
        >
          <Heading2 className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          title="Bold"
          onPress={() => handleFormat("wrap", "**", "**", "太字テキスト")}
        >
          <Bold className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          title="Italic"
          onPress={() => handleFormat("wrap", "*", "*", "斜体テキスト")}
        >
          <Italic className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          title="Strikethrough"
          onPress={() => handleFormat("wrap", "~~", "~~", "テキスト")}
        >
          <Strikethrough className="size-4" />
        </Button>
        <div className="w-px h-4 bg-border mx-0.5 shrink-0" />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          title="Inline code"
          onPress={() => handleFormat("wrap", "`", "`", "code")}
        >
          <Code className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          title="Code block"
          onPress={() => handleFormat("wrap", "```\n", "\n```", "コード")}
        >
          <SquareCode className="size-4" />
        </Button>
        <div className="w-px h-4 bg-border mx-0.5 shrink-0" />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          title="Blockquote"
          onPress={() => handleFormat("linePrefix", "> ")}
        >
          <Quote className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          title="Horizontal rule"
          onPress={() => handleFormat("linePrefix", "---\n")}
        >
          <Minus className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          title="Link"
          onPress={() => handleFormat("wrap", "[", "](url)", "リンクテキスト")}
        >
          <Link className="size-4" />
        </Button>
        <ImageUploadButton onInsert={insertAtCursor} />

        <div className="flex-1" />

        {/* 表示モード切替 */}
        <div className="flex items-center rounded-md border border-border overflow-hidden shrink-0">
          {(
            [
              { mode: "edit", icon: PenLine, label: "Write" },
              { mode: "split", icon: Columns2, label: "Split" },
              { mode: "preview", icon: Eye, label: "Preview" },
            ] as { mode: ViewMode; icon: React.ElementType; label: string }[]
          ).map(({ mode: m, icon: Icon, label }) => (
            <button
              key={m}
              type="button"
              title={label}
              onClick={() => setViewMode(m)}
              className={cn(
                "flex items-center justify-center size-7 transition-colors",
                viewMode === m
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              <Icon className="size-3.5" />
            </button>
          ))}
        </div>
      </div>

      {/* エディタ + プレビュー */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {(viewMode === "edit" || viewMode === "split") && (
          <textarea
            ref={contentRef}
            defaultValue={initialContent}
            onChange={(e) => {
              setPreviewContent(e.target.value);
              if (snapshotTimer.current) clearTimeout(snapshotTimer.current);
              snapshotTimer.current = setTimeout(saveSnapshot, SNAPSHOT_DEBOUNCE_MS);
              scheduleAutoSave(formData);
            }}
            onKeyDown={(e) => {
              const mod = e.ctrlKey || e.metaKey;
              if (mod && !e.altKey) {
                if (e.key === "z" && !e.shiftKey) {
                  e.preventDefault();
                  handleUndo();
                  return;
                }
                if ((e.key === "z" && e.shiftKey) || e.key === "y") {
                  e.preventDefault();
                  handleRedo();
                  return;
                }
              }
              // Enter でパラグラフ境界スナップショット
              if (e.key === "Enter") flushAndSave();
            }}
            placeholder="本文を Markdown で書く..."
            className="flex-1 min-h-0 resize-none p-6 font-mono text-sm leading-7 bg-background border-none outline-none focus:outline-none placeholder:text-muted-foreground/30 overflow-y-auto"
          />
        )}
        {viewMode === "split" && <div className="w-px bg-border shrink-0" />}
        {(viewMode === "preview" || viewMode === "split") && (
          <div className="flex-1 min-h-0 overflow-y-auto p-6 bg-background">
            <div className="max-w-2xl mx-auto">
              <MarkdownPreview markdown={debouncedContent} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
