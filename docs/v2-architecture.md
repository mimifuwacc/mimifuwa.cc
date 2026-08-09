# v2 architecture

The v2 applications run beside the current applications so they can be reviewed and deployed
without changing the existing production path.

```text
Browser -> web-v2 (Astro SSR) -> api-v2 -> D1 metadata
                               -> Markdown -> R2
                    Markdown -> @mimifuwacc/parser -> HTML
```

## Boundaries

- `@mimifuwacc/blog-domain` defines the transport-neutral published-post contract.
- `api-v2` owns content access. Its public representation is Markdown, never rendered HTML.
- `web-v2` owns presentation and converts Markdown to HTML during server rendering.
- The existing `web` and `api` applications remain unchanged while v2 is developed.

Generated HTML may remain in R2 as a legacy publish-time cache, but it is not part of the v2
domain API. A future content IR can replace Markdown without coupling the API to Astro.

## Migration stack

1. Add the shared domain contract and document the boundary.
2. Add the read-only Effect-based content API (`api-v2`).
3. Add the Astro server-rendered consumer (`web-v2`).

Merge the pull requests from the bottom of the stack upward.
