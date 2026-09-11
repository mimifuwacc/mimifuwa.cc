import { describe, expect, it } from "vite-plus/test";
import { transform } from "@ox-content/napi";

const source = `---
title: Ox Content fixture
---

## Heading

- [x] done

<Tweet id="123" />
`;

function applyTwitterEmbedPlugin(html: string): string {
  return html.replace(
    /<Tweet\s+id=["']([0-9]+)["']\s*\/?\s*>/g,
    (_match, id: string) =>
      `<div class="embed embed-twitter" data-embed="twitter" data-twitter-id="${id}" ` +
      `style="aspect-ratio: 1 / 1">` +
      `<a href="https://x.com/i/status/${id}">View post on X</a>` +
      `</div>`,
  );
}

describe("ox-content spike", () => {
  it("keeps frontmatter, GFM, and TOC information in the transform API", () => {
    const result = transform(source, { gfm: true });

    expect(result.errors).toEqual([]);
    expect(JSON.parse(result.frontmatter)).toEqual({ title: "Ox Content fixture" });
    expect(result.toc).toEqual([{ depth: 2, text: "Heading", slug: "heading", children: [] }]);
    expect(result.html).toContain('<input type="checkbox" checked disabled>');
  });

  it("allows a project-owned HTML transform after rendering", () => {
    const transformed = transform(source, { gfm: true });
    const html = applyTwitterEmbedPlugin(transformed.html);

    expect(transformed.errors).toEqual([]);
    expect(html).toContain('data-embed="twitter"');
    expect(html).toContain('data-twitter-id="123"');
    expect(html).toContain('style="aspect-ratio: 1 / 1"');
    expect(html).toContain("View post on X");
  });
});
