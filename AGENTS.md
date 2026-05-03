# AGENTS.md

This file provides guidance to agents when working with code in this repository.

**This is a public GitHub repository.** Never commit secrets, API keys, tokens,
or real credentials. Use `.env.example` with placeholder values only.

## Project Overview

`create-next-strict` is a single-script CLI tool (`setup-next.js`) that wraps
Create Next App to scaffold Next.js projects with opinionated strict defaults:
Biome linting/formatting, Drizzle ORM + Neon PostgreSQL, Vitest + Testing
Library, Prettier for markdown/HTML, Volta for Node version pinning, and Zed
editor settings.

The script also generates an `AGENTS.md` file (symlinked as `CLAUDE.md` and
`.github/copilot-instructions.md`) inside scaffolded projects.

## Running the Tool

```bash
create-next-strict              # Run setup (scaffold if needed + apply defaults)
create-next-strict --dry-run    # Preview what would be created/modified
create-next-strict --help       # Show usage
```

Auto-detects context: scaffolds with `create-next-app` if no `package.json`
exists, otherwise applies strict defaults to the existing project.

## Development

```bash
npm run verify     # Dry-run test + lint:fix — run before every commit
npm test           # Dry-run setup (no writes, no scaffold) — fast sanity check
npm run test:seed  # Real end-to-end scaffold into ./test-app (slow; runs create-next-app)
npm run test:clean # Remove ./test-app
npm run lint:fix   # Biome + Prettier auto-fix
```

`npm run verify` is the standard pre-commit check for **this** repo (dry-run
test + lint:fix). It's fast and catches most issues, but it can't validate
anything that depends on `create-next-app`'s actual output.

For changes that touch JSON modifiers, template files, or installed packages,
also run `npm run test:seed` followed by `cd test-app && npm run verify` — that
confirms the scaffolded project's own typecheck + lint + tests all pass against
a real, freshly created Next.js project.

## Architecture

Two pieces:

- **`setup-next.js`** — single CLI script. Top of file is `SETUP_CONFIG`
  (packages, devPackages, JSON modifiers, symlinks). Below that is the linear
  pipeline: scaffold → install → copy templates → mutate JSON configs → symlink
  → lint:fix → test.
- **`templates/`** — directory whose layout mirrors the output project. Every
  file here is copied verbatim into the scaffolded project at the same relative
  path. Files whose name contains the `.append` marker (e.g.
  `.gitignore.append`, `README.append.md`) are appended to the existing target
  instead of overwriting.

JSON modifiers in `SETUP_CONFIG.jsonModifications` run **after** template files
are written, so they can assume `create-next-app`'s defaults are present (e.g.
`biome.json` already has a `files.includes` array — modifiers merge into it
rather than replace).

## How to Extend

| Goal                                          | Where                                                      |
| --------------------------------------------- | ---------------------------------------------------------- |
| Add a runtime/dev dependency                  | `SETUP_CONFIG.packages` / `devPackages` in `setup-next.js` |
| Add a new config file as-is                   | Drop into `templates/` at the desired path                 |
| Append to a file create-next-app makes        | Name it `<target>.append` in `templates/`                  |
| Modify JSON that create-next-app produces     | Add a function under `SETUP_CONFIG.jsonModifications`      |
| Add a new symlink                             | `SETUP_CONFIG.symlinks` (target → array of link paths)     |
| Update agent guidance for scaffolded projects | Edit `templates/AGENTS.md`                                 |
| Update testing guidance                       | Edit `templates/docs/TESTING.md`                           |

After any change, run `npm run test:seed` and then
`cd test-app && npm run verify` to confirm the scaffolded project still passes
its own checks.

## Conventions Enforced in Generated Projects

- Tabs (not spaces), 80-column line width
- Biome for JS/TS/CSS/JSON; Prettier only for markdown/HTML
- Biome `next` + `react` lint domains on; `noDuplicateTestHooks` off (so
  single-concern `beforeEach` hooks are allowed — see
  `templates/docs/TESTING.md`)
- Named exports preferred (default exports only for pages/layouts)
- Function declarations for components (not arrow functions)
- Vitest + Testing Library for unit/component tests
- Repository pattern for database access (`src/db/repositories/`)
- Drizzle uses `neon-serverless` + `Pool` (transactions supported, unlike the
  HTTP driver)
- `drizzle.config.ts` calls `loadEnvConfig` from `@next/env` so `.env.local`
  works for `db:generate` / `db:migrate` out of the box
- Import alias `@/*` → `src/*`
- `npm run verify` runs `test → lint:fix → typecheck` (fail-fast on tests)
