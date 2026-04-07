# AGENTS.md

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Database:** [Neon](https://neon.tech/) (Serverless Postgres)
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
- **Linter/Formatter:** [Biome](https://biomejs.dev/) for JS/TS/CSS/JSON
- **Testing:** [Vitest](https://vitest.dev/) +
  [Testing Library](https://testing-library.com/)
- **Formatter (MD/HTML):** [Prettier](https://prettier.io/)
- **Node version manager:** [Volta](https://volta.sh/)

## Project Structure

This project uses the `src/` directory layout with the App Router:

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── components/   # Global, reusable components
│   ├── dashboard/
│   │   ├── page.tsx
│   │   └── components/ # Components scoped to /dashboard
│   └── ...
├── db/
│   ├── index.ts          # Drizzle client + Neon connection
│   ├── schema.ts         # Table definitions
│   └── repositories/     # Repository pattern for DB access
│       ├── index.ts      # Barrel export
│       └── example.ts    # Example repository
└── ...
```

## Component Organization

- Use **design system patterns** — build a consistent library of reusable,
  composable UI components with clear props interfaces rather than one-off
  inline markup.
- **Global components** shared across multiple pages go in
  `src/app/components/`.
- **Scoped components** that are only relevant to a single page or parent
  component go in a `components/` directory colocated with that page or
  component.

## Database & Repository Pattern

- All database interactions go through **repositories** in
  `src/db/repositories/`.
- Each repository encapsulates queries for a specific domain (e.g.,
  `UserRepository`, `PostRepository`).
- Never import `db` directly in route handlers or components — always go through
  a repository.
- Define tables in `src/db/schema.ts` using Drizzle's schema API.
- Use `npm run db:generate` to create migrations after schema changes, then
  `npm run db:migrate` to apply them.

## Coding Conventions

- **Indentation:** Tabs (not spaces)
- **Line width:** 80 columns
- **Import alias:** `@/*` maps to `src/*`
- **Imports:** Auto-organized by Biome
- **Object properties:** Auto-sorted by Biome
- Prefer named exports over default exports (except for pages/layouts)
- Use `function` declarations for components, not arrow functions

## Commands

| Command               | Description                             |
| --------------------- | --------------------------------------- |
| `npm run dev`         | Start dev server (Turbopack)            |
| `npm run build`       | Production build                        |
| `npm run start`       | Start production server                 |
| `npm run lint`        | Check with Biome + Prettier             |
| `npm run format`      | Auto-fix with Biome                     |
| `npm run lint:fix`    | Auto-fix with Biome + Prettier          |
| `npm run db:generate` | Generate migrations from schema         |
| `npm run db:migrate`  | Run pending migrations                  |
| `npm run db:push`     | Push schema directly (dev shortcut)     |
| `npm run db:studio`   | Open Drizzle Studio (visual DB browser) |
| `npm run test`        | Run tests once                          |
| `npm run test:watch`  | Run tests in watch mode                 |

## Before Submitting Changes

1. Run `npm run test` to verify all tests pass
2. Run `npm run lint:fix` to auto-format and fix lint issues
3. Run `npm run build` to verify the project compiles without errors
