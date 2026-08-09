# UI development

Shared React components live in `packages/ui`. The package owns the source so that web and admin
consume one reviewed implementation.

## Component policy

- Use shadcn with the React Aria base (`aria` / `aria-nova`).
- Prefer React Aria Components' semantics over recreating focus, keyboard, and overlay behavior.
- Keep component names and variants stable at the `@mimifuwacc/ui/components/ui/*` boundary.
- Keep fetching, Effect programs, Zustand stores, route knowledge, and domain types out of this
  package.
- Use `Button` for actions and `LinkButton` for navigation. Do not emulate a link by replacing a
  button's rendered element.

## Adding a component

Run the shadcn CLI with `packages/ui/components.json` as the project configuration, then review the
generated code and imports before committing. Generated output is a starting point, not an opaque
vendor directory.

After adding or changing a primitive:

1. migrate every repository consumer in the same pull request;
2. run the UI type check;
3. run type checks and production builds for affected applications; and
4. verify focus, Escape dismissal, keyboard activation, and accessible naming where applicable.

Base UI and direct application imports from primitive libraries are not supported. A primitive
change is made once in `packages/ui` and exposed through the package export map.
