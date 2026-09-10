# Content repository and CLI

## Ownership

The public site repository is `mimifuwacc/mimifuwa.cc`. Article source is kept
in the private repository `mimifuwacc/mimifuwa.cc-content` and is not mirrored
into the public repository.

The public repository owns the renderer, the `@mimifuwacc/cli` package, and the
production build. The content repository owns Markdown, frontmatter, and
article assets.

```text
mimifuwacc/mimifuwa.cc
  packages/cli       @mimifuwacc/cli / mimifuwacc
  packages/parser    project-owned Markdown transforms
  apps/web           static site build

mimifuwacc/mimifuwa.cc-content (private)
  articles/          Markdown articles; status is defined by frontmatter
  assets/            article assets
```

## Visibility boundary

Drafts must exist only in the private content repository. They must not be
added to the public site's Git history, pull requests, build artifacts, or
preview deployments.

The content repository uses `status` in frontmatter as the single source of
truth. Articles are not separated into `published/` and `drafts/` directories:

```yaml
status: draft
```

or:

```yaml
status: published
```

The local CLI reads all articles because it is used from the private content
repository:

```sh
mimifuwacc preview
mimifuwacc check
```

Only the production `build` command selects `status: published`, and it must
fail when a selected article does not declare that status.

## Delivery

Production CI checks out the private content repository using a scoped GitHub
App token or deploy key, runs the static build, and deploys only generated
files. The private checkout is ephemeral and is never committed to the public
repository.

Publishing is a content-repository event: merging a content PR dispatches a
build of `mimifuwacc/mimifuwa.cc`. A public-site source change also triggers
the same build, using the pinned content revision configured by CI.

The local CLI and the public build must use the same renderer and embed
geometry rules. This keeps draft preview close to production while preserving
the strict production visibility boundary.
