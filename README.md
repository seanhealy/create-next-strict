# create-next-strict

Scaffold a Next.js project with opinionated strict defaults in one command.

## What You Get

| Category             | Choice                                                                          |
| -------------------- | ------------------------------------------------------------------------------- |
| Language             | TypeScript                                                                      |
| Router               | App Router with `src/` directory                                                |
| Linter/Formatter     | [Biome](https://biomejs.dev/) (JS/TS/CSS/JSON)                                  |
| Testing              | [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/) |
| Formatter (MD/HTML)  | [Prettier](https://prettier.io/)                                                |
| Database             | [Neon](https://neon.tech/) (Serverless Postgres)                                |
| ORM                  | [Drizzle ORM](https://orm.drizzle.team/)                                        |
| React Compiler       | Enabled                                                                         |
| Node version manager | [Volta](https://volta.sh/)                                                      |
| Editor               | [Zed](https://zed.dev/) settings included                                       |
| Indentation          | Tabs, 80-column line width                                                      |

## Usage

```bash
mkdir my-app && cd my-app
npx create-next-strict --init --write
```

### Options

| Flag              | Description                                                |
| ----------------- | ---------------------------------------------------------- |
| `--init`, `-i`    | Scaffold a new Next.js project first (via create-next-app) |
| `--write`, `-w`   | Apply changes (required to make actual modifications)      |
| `--dry-run`, `-d` | Preview changes without applying                           |
| `--help`, `-h`    | Show help                                                  |

### Examples

```bash
# Full setup: scaffold + customize
create-next-strict --init --write

# Apply customizations to an existing Next.js project
create-next-strict --write

# Preview what would happen
create-next-strict --init --dry-run
```
