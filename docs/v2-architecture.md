# v2 architecture and implementation policy

This document is the decision record for the v2 refactor. New code follows these boundaries by
default. A pull request that crosses a boundary must explain why and update this document when the
exception is intended to remain.

## Target architecture

```text
Browser
  |
  +-- web-v2 (Astro)
  |     routing, SSR, documents, metadata, cache, island boundaries
  |          |
  |          +-- React islands
  |          |     interactive UI only
  |          |     +-- Zustand vanilla (only shared mutable island state)
  |          |
  |          +-- @mimifuwacc/parser
  |                Markdown -> HTML
  |
  +-- admin (temporary Next.js consumer)
             |
             +---------------------- api-v2 (Hono + Effect)
                                      domain use cases and content access
                                           |               |
                                      Drizzle -> D1    Markdown -> R2
```

The arrows are dependency arrows. Presentation depends on application contracts; the domain and
data layers never depend on Astro, React, Zustand, or UI components.

## Ownership and boundaries

### `apps/api-v2`

- Owns content use cases, authorization, validation, typed errors, and persistence orchestration.
- Owns the Drizzle schema and migrations for D1.
- Stores and returns canonical article content as Markdown. Rendered HTML is not part of its public
  contract.
- Uses Effect for asynchronous workflows, dependencies, resource lifetime, retries, and domain
  errors. Errors are translated to HTTP only at the Hono boundary.
- May make breaking API and schema changes while v2 replaces the old API, but every schema change
  that can reach an existing database requires a forward migration. Recreating production data is
  never an accepted migration strategy.

### `apps/web-v2`

- Astro owns URL routing, request handling, SSR, page metadata, and the HTML document.
- Markdown is rendered on the server through `@mimifuwacc/parser`.
- React is introduced only where browser interaction or local component state requires it. Static
  content remains Astro and ships no React runtime.
- Network reads needed to render a page happen at the Astro server boundary, not in a client store.
- A missing API resource is mapped intentionally to an Astro 404; transport and server failures are
  reported as failures rather than disguised as not-found pages.

### `apps/admin`

- Admin is an API consumer and contains no database implementation knowledge.
- Next.js is temporary and does not define the target architecture. New reusable presentation and
  domain behavior belongs in packages with explicit boundaries.
- Admin uses the same v2 API in development and production. Development endpoints must use local
  Wrangler D1/R2 state unless a remote environment is explicitly selected.

### `packages/ui`

- Is a small, application-agnostic design system based on shadcn's React Aria components.
- May depend on React Aria Components, styling helpers, and icons.
- Must not depend on Effect, Zustand, application routes, API clients, domain models, or data-fetching
  libraries.
- Exposes stable project-owned components. Applications import from `@mimifuwacc/ui`; they do not
  import primitive libraries directly.
- Generated shadcn code is reviewed and committed as project code. Regeneration is not assumed to be
  a safe automatic upgrade.

### `packages/parser`

- Is the only Markdown-to-HTML implementation used by v2 consumers.
- Rendering is deterministic for a Markdown value plus an explicit parser/renderer version.
- It has no knowledge of HTTP, databases, Astro pages, or React components.

## Known migration debt

The target boundaries above are stricter than the current repository. Until their consumers are
migrated, `packages/ui/src/components/content-renderer.tsx` and `link-card.tsx` still couple the UI
package to the parser and TanStack Query. They are legacy application components, not precedents for
new shared UI. Move them to their consuming application, then remove `@mimifuwacc/parser` and
`@tanstack/react-query` from `packages/ui` in a dedicated follow-up slice.

## Client state rule

Use ordinary component state first. Use Zustand's vanilla store only when mutable client state must
be shared by two or more independently hydrated islands. Stores do not fetch server data, mirror the
API cache, or contain domain workflows. Each SSR request and each browser page receives the intended
store lifetime; module-global mutable stores are forbidden for request-scoped state.

## Render cache rule

Markdown is canonical and rendered HTML is derived. A render-cache key includes at least:

```text
sha256(markdown bytes + parser version + renderer version)
```

The cache may be discarded and rebuilt at any time. Publishing Markdown and invalidating derived
HTML must not require rewriting the canonical content. Until this cache exists, server-side rendering
without a persistent HTML cache is correct behavior.

## UI implementation rule

The selected shadcn base is React Aria (`aria`), currently represented by the `aria-nova` style.
React Aria state uses its native API (`isOpen`, `onOpenChange`, `isSelected`, `onChange`, and
`onPress`) at primitive boundaries. Application-facing wrappers may narrow that API but must retain
keyboard, focus, labeling, and overlay behavior.

Add or refresh a component from `packages/ui`, inspect the diff, and then migrate consumers. Do not
run shadcn from an application directory and create a second copy of a shared primitive.

## Pull request sequence

Keep changes reviewable and merge them in dependency order:

1. Architecture policy and React Aria design-system foundation.
2. API domain/use-case boundaries and Effect error model.
3. Drizzle schema and forward-only data migrations.
4. Astro SSR, Markdown renderer, and content-addressed render cache.
5. React island reduction and, only where justified, Zustand vanilla stores.
6. Remove replaced v1 applications and compatibility code.

Later changes can be stacked on an earlier open pull request, but each commit and pull request must
build on its own declared base.

## Definition of done

A refactor slice is complete when:

- dependency direction matches this document;
- database changes include a tested migration and preserve existing data;
- local development uses local Cloudflare resources by default;
- type checks and production builds pass for every affected workspace;
- keyboard and focus behavior is retained for changed interactive components;
- obsolete dependencies and compatibility code in that slice are removed; and
- the relevant design decision and operational command are documented.
