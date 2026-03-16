# AGENTS.md

This file provides guidance to agents when working with code in this repository.

**This is a public GitHub repository.** Never commit secrets, API keys, tokens, or real credentials. Use `.env.example` with placeholder values only.

## Project Overview

`create-next-strict` is a single-script CLI tool (`setup-next.js`) that wraps Create Next App to scaffold Next.js projects with opinionated strict defaults: Biome linting/formatting, Drizzle ORM + Neon PostgreSQL, Prettier for markdown/HTML, Volta for Node version pinning, and Zed editor settings.

The script also generates an `AGENTS.md` file (symlinked as `CLAUDE.md` and `.github/copilot-instructions.md`) inside scaffolded projects.

## Running the Tool

```bash
create-next-strict --init --write    # Scaffold a new project and apply all modifications
create-next-strict --init --dry-run  # Preview what would be created/modified
create-next-strict --help            # Show usage
```

Flags: `--init`/`-i` (scaffold), `--write`/`-w` (apply changes), `--dry-run`/`-d` (preview only).

## Architecture

Everything lives in `setup-next.js` (~774 lines). Key structure:

- **`SETUP_CONFIG`** (top of file) — Central configuration object defining all defaults: dependencies, Biome settings, Prettier config, npm scripts, Volta versions, editor settings, and file templates.
- **File creation/modification functions** — Each handles a specific config file or project modification (biome.json, package.json, .prettierrc.js, drizzle.config.ts, db schema, etc.).
- **`AGENTS.md` template** — Embedded markdown string that becomes the AI assistant guide in scaffolded projects.
- **CLI entry point** — Parses args, runs `create-next-app`, then applies all modifications.

## Conventions Enforced in Generated Projects

- Tabs (not spaces), 80-column line width
- Biome for JS/TS/CSS/JSON; Prettier only for markdown/HTML
- Named exports preferred (default exports only for pages/layouts)
- Function declarations for components (not arrow functions)
- Repository pattern for database access (`src/db/repositories/`)
- Import alias `@/*` → `src/*`
