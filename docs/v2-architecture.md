# v2 architecture

The v2 applications run beside the current applications so they can be reviewed and deployed
without changing the existing production path.

```text
Browser -> web-v2 (Astro SSR) -> api-v2 -> D1 metadata
                               -> Markdown -> R2
                    Markdown -> @mimifuwacc/parser -> HTML
```

## Boundaries

- `api-v2` owns the domain model, Drizzle schema, and content access. Its public representation is
  Markdown, never rendered HTML.
- `web-v2` owns presentation and converts Markdown to HTML during server rendering.
- The existing `web` and `api` applications remain unchanged while v2 is developed.

Generated HTML may remain in R2 as a legacy publish-time cache, but it is not part of the v2
domain API. A future content IR can replace Markdown without coupling the API to Astro.

## Migration stack

1. Make `api-v2` the owner of the content model and database schema.
2. Move the admin and public reads to the Effect-based content API.
3. Render Markdown in the Astro server-rendered consumer (`web-v2`).

Merge the pull requests from the bottom of the stack upward.
