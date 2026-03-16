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
npx create-next-strict
```

Automatically detects context:

- **Empty directory** (no `package.json`) — scaffolds with `create-next-app`,
  then applies strict defaults
- **Existing project** (has `package.json`) — applies strict defaults only

### Options

| Flag              | Description                      |
| ----------------- | -------------------------------- |
| `--dry-run`, `-d` | Preview changes without applying |
| `--help`, `-h`    | Show help                        |

### Examples

```bash
# Full setup: scaffold a new project + apply strict defaults
mkdir my-app && cd my-app
npx create-next-strict

# Apply strict defaults to an existing Next.js project
cd existing-app
npx create-next-strict

# Preview what would happen
npx create-next-strict --dry-run
```
