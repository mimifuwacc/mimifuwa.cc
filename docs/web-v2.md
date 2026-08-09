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
ID copy feedback, hero parallax, table-of-contents scroll tracking, OGP card enhancement, Twitter
widgets, and code copy feedback use small page scripts. Add a React island only when an interaction
becomes too stateful to express clearly this way.

`parseArticleToHtml` assigns deterministic heading IDs and collects the table of contents while the
article is still a HAST tree. It also turns code blocks and standalone URLs into semantic article
elements before serialization; web-v2 does not post-process generated HTML with regular
expressions. Markdown remains the canonical value.

A regular standalone URL is initially rendered as a usable hostname link. The browser progressively
enhances it with title, description, favicon, and image data from `api-v2 /ogp`. That endpoint accepts
only public HTTP(S) targets, validates every redirect, limits response size and duration, and returns
a hostname-only fallback when upstream metadata cannot be loaded. Twitter/X URLs instead render a
dedicated widgets.js target and are reloaded when the site theme changes.

## Local development

From the repository root, run:

```sh
vp run dev
```

This starts `api-v2`, `web-v2`, and admin. `api-v2` persists to the same local Wrangler state used by
the previous API, and `web-v2` reads it through `http://localhost:8787` by default. The public site is
available at `http://localhost:4321`.

SSR content requests select the API from the incoming web hostname: localhost uses the local API,
`mimifuwacc-devel.m8c.workers.dev` uses the devel API Worker, and production uses
`api.mimifuwa.cc`. Do not rely exclusively on a build-time environment variable for this routing;
Cloudflare SSR executes after the build environment is gone.

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

## Deployment cutover

The v2 workers intentionally use the existing production and devel Worker names. Deploying replaces
the old Worker code but keeps the D1 and R2 resources. CI applies the forward-only `api-v2` Drizzle
migrations before deploying the API, then builds web and admin with an explicit public `API_V2_URL`.
`api-v2` also owns `/og/*`; generated PNGs are cached in R2 and invalidated when an article is
updated, archived, renamed, or deleted.

`api-v2` additionally owns `/ogp`; this fetches external page metadata for progressively enhanced
article link cards. It does not use D1 or R2 and must retain its public-target and redirect checks.

Astro 6 selects the Wrangler environment at build time. Devel therefore sets
`CLOUDFLARE_ENV=devel` for both build and deploy; do not restore the old `wrangler deploy --env`
pattern. Production uses the default environment.
