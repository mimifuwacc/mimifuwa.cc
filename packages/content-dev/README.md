# Local content fixtures

This package mirrors the `mimifuwa.cc-content/articles` layout with a few short
post and work entries for local site development. The site processes these
through the same Ox Content pipeline as the real content repository.

```text
articles/
  posts/
  works/
```

Work articles can set a `date` in frontmatter to control their position in the
Works lists and display on each card. Set `pinned: true` to keep a work at the
top; pinned works are sorted by date, followed by the remaining works in
newest-first order. Entries without a date follow dated entries.

Use Ox Content card blocks in Markdown:

```md
::: link-card[Project name]{https://example.com}
A short description of the project.
:::
```

For a preview generated from a page's Open Graph metadata, use a one-line tag:

```md
<OgCard url="https://example.com" />
```

The content CLI can override this directory with `CONTENT_DIR` when developing
or building `mimifuwa.cc-content` itself.
