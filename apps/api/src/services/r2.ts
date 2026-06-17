export class R2Service {
  constructor(private bucket: R2Bucket) {}

  // Upload Markdown content to R2
  async uploadMarkdown(key: string, content: string): Promise<void> {
    await this.bucket.put(key, content, {
      httpMetadata: {
        contentType: "text/markdown; charset=UTF-8",
      },
    });
  }

  // Upload HTML content to R2
  async uploadHtml(key: string, content: string): Promise<void> {
    await this.bucket.put(key, content, {
      httpMetadata: {
        contentType: "text/html; charset=UTF-8",
      },
    });
  }

  // Upload both Markdown and HTML content
  async uploadPostContent(slug: string, markdown: string, html: string): Promise<void> {
    await Promise.all([
      this.uploadMarkdown(`posts/${slug}.md`, markdown),
      this.uploadHtml(`posts/${slug}.html`, html),
    ]);
  }

  // Upload content to R2 (legacy method)
  async uploadContent(key: string, content: string, contentType = "text/markdown"): Promise<void> {
    await this.bucket.put(key, content, {
      httpMetadata: {
        contentType,
      },
    });
  }

  // Delete all post content (both .md and .html)
  async deletePostContent(slug: string): Promise<void> {
    await this.bucket.delete([`posts/${slug}.md`, `posts/${slug}.html`]);
  }

  // Delete content from R2
  async deleteContent(key: string): Promise<boolean> {
    await this.bucket.delete(key);
    return true;
  }

  // Check if content exists
  async contentExists(key: string): Promise<boolean> {
    const object = await this.bucket.head(key);
    return object !== null;
  }

  // Download Markdown content from R2
  async downloadMarkdown(slug: string): Promise<string | null> {
    return this.downloadContent(`posts/${slug}.md`);
  }

  // Download HTML content from R2
  async downloadHtml(slug: string): Promise<string | null> {
    return this.downloadContent(`posts/${slug}.html`);
  }

  // Download content from R2
  async downloadContent(key: string): Promise<string | null> {
    const object = await this.bucket.get(key);
    if (!object) return null;

    const text = await object.text();
    return text;
  }

  // Generate content hash (SHA-256)
  async generateContentHash(content: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }
}
