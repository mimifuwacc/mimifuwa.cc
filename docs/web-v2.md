# web-v2 implementation

`apps/web-v2` is the Astro SSR replacement for the public v1 React application. Astro owns every
public route and fetches published content from `api-v2` on the server.

## Routes

| Route              | Responsibility                                       |
| ------------------ | ---------------------------------------------------- |
| `/`                | Portfolio home, profile, works, and six recent posts |
| `/blogs`           | Published article list                               |
| `/blogs/[...slug]` | Markdown article rendered by `@mimifuwacc/parser`    |
| `/links`           | External links page                                  |
| `/blog/[...slug]`  | Permanent redirect for the early v2 singular URL     |
| `/404`             | Explicit not-found response                          |

An `api-v2` 404 becomes an Astro 404. Other API and decoding errors remain server errors so an
operational failure is not cached or presented as missing content.

## Browser behavior

The current public site needs no React runtime. Theme switching, the mobile navigation menu, session
ID copy feedback, hero parallax, and table-of-contents scroll tracking use small page scripts. Add a
React island only when an interaction becomes too stateful to express clearly this way.

Article headings receive deterministic IDs after Markdown rendering. Raw link-card placeholders are
turned into safe server-rendered fallback links, so article URLs remain usable without a client-side
OGP request. Markdown remains the canonical value.

## Local development

From the repository root, run:

```sh
vp run dev
```

This starts `api-v2`, `web-v2`, and admin. `api-v2` persists to the same local Wrangler state used by
the previous API, and `web-v2` reads it through `http://localhost:8787` by default. The public site is
available at `http://localhost:4321`.

The Cloudflare configuration enables `nodejs_compat` because the Markdown toolchain imports supported
Node compatibility modules. Keep runtime checks for an actual article in addition to `astro build`;
the production build alone does not execute the Markdown route.

## Verification

Run the following before merging a web-v2 change:

```sh
vp run --filter @mimifuwacc/web-v2 typecheck
vp run --filter @mimifuwacc/web-v2 build
```

With the development stack running, verify `/`, `/blogs`, `/links`, an existing nested article slug,
a missing nested slug, and the `/blog/*` redirect.
