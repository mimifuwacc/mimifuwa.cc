# Local content fixtures

This package mirrors the `mimifuwa.cc-content/articles` layout with a few short
blog and work entries for local site development. The site processes these
through the same Ox Content pipeline as the real content repository.

```text
articles/
  blogs/
  works/
```

The content CLI can override this directory with `CONTENT_DIR` when previewing
or building `mimifuwa.cc-content` itself.
