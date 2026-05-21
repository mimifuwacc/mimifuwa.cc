"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MarkdownPreview } from "@/components/markdown-preview";
import { TabSwitcher } from "@/components/tab-switcher";
import { useDebounce } from "@/components/use-debounce";
import { deletePost, updatePost } from "@/lib/graphql/actions";

interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  markdown: string;
  date: string;
  draft: boolean;
  tags: Array<{ id: string; name: string }>;
}

interface PostFormProps {
  post: Post;
}

export function PostForm({ post }: PostFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: post.title,
    excerpt: post.excerpt,
    content: post.markdown || post.content,
    tags: post.tags.map((t) => t.name).join(", "),
    draft: post.draft,
  });

  // Preview state
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [isSplitView, setIsSplitView] = useState(false);
  const debouncedContent = useDebounce(formData.content, 500);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Create FormData from state
    const formDataObj = new FormData();
    formDataObj.append("title", formData.title);
    formDataObj.append("excerpt", formData.excerpt);
    formDataObj.append("content", formData.content);
    formDataObj.append("tags", formData.tags);
    formDataObj.append("draft", formData.draft ? "true" : "false");

    const result = await updatePost(post.slug, formDataObj);

    if (result.success) {
      router.push("/");
    } else {
      setError(result.message);
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this post?")) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    const result = await deletePost(post.slug);

    if (result.success) {
      router.push("/");
    } else {
      setError(result.message);
      setIsDeleting(false);
    }
  }

  const updateField = (field: keyof typeof formData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Edit Post: {post.slug}</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <TabSwitcher
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isSplitView={isSplitView}
        onSplitViewToggle={() => setIsSplitView(!isSplitView)}
      />

      <form onSubmit={handleSubmit}>
        {/* Metadata fields - always at top */}
        <div className="max-w-2xl space-y-4 mb-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => updateField("title", e.target.value)}
              required
              disabled={isSubmitting || isDeleting}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100"
            />
          </div>

          <div>
            <label htmlFor="excerpt" className="block text-sm font-medium text-slate-700 mb-1">
              Excerpt
            </label>
            <textarea
              id="excerpt"
              rows={2}
              value={formData.excerpt}
              onChange={(e) => updateField("excerpt", e.target.value)}
              required
              disabled={isSubmitting || isDeleting}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100"
            />
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-slate-700 mb-1">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              id="tags"
              value={formData.tags}
              onChange={(e) => updateField("tags", e.target.value)}
              placeholder="tech, javascript, web"
              disabled={isSubmitting || isDeleting}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="draft"
              checked={formData.draft}
              onChange={(e) => updateField("draft", e.target.checked)}
              disabled={isSubmitting || isDeleting}
              className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 disabled:bg-slate-100"
            />
            <label htmlFor="draft" className="ml-2 text-sm text-slate-700">
              Save as draft
            </label>
          </div>
        </div>

        {/* Content and Preview - split or single view */}
        {isSplitView ? (
          <div className="grid grid-cols-2 gap-4">
            {/* Content textarea */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-slate-700 mb-1">
                Content (Markdown)
              </label>
              <textarea
                id="content"
                rows={30}
                value={formData.content}
                onChange={(e) => updateField("content", e.target.value)}
                required
                disabled={isSubmitting || isDeleting}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm disabled:bg-slate-100"
              />
            </div>

            {/* Preview */}
            <div className="border border-slate-300 rounded-lg p-4 overflow-y-auto">
              <MarkdownPreview markdown={debouncedContent} />
            </div>
          </div>
        ) : (
          <>
            {/* Single view mode */}
            {activeTab === "edit" && (
              <div className="max-w-2xl">
                <label htmlFor="content" className="block text-sm font-medium text-slate-700 mb-1">
                  Content (Markdown)
                </label>
                <textarea
                  id="content"
                  rows={15}
                  value={formData.content}
                  onChange={(e) => updateField("content", e.target.value)}
                  required
                  disabled={isSubmitting || isDeleting}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm disabled:bg-slate-100"
                />
              </div>
            )}

            {activeTab === "preview" && (
              <div className="border border-slate-300 rounded-lg p-4 overflow-y-auto">
                <MarkdownPreview markdown={debouncedContent} />
              </div>
            )}
          </>
        )}

        {/* Submit buttons */}
        <div className="max-w-2xl flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting || isDeleting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400"
          >
            {isSubmitting ? "Updating..." : "Update Post"}
          </button>
          <a
            href="/"
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
          >
            Cancel
          </a>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isSubmitting || isDeleting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-slate-400 ml-auto"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </form>
    </div>
  );
}
