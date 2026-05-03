## Project Setup

This project was scaffolded with
[`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app)
and customized with `setup-next.js` using the following choices:

| Category             | Choice                                                                          |
| -------------------- | ------------------------------------------------------------------------------- |
| Language             | TypeScript                                                                      |
| Linter               | [Biome](https://biomejs.dev/)                                                   |
| React Compiler       | Enabled                                                                         |
| CSS                  | CSS Modules (Tailwind opt-out)                                                  |
| Project structure    | `src/` directory                                                                |
| Router               | App Router                                                                      |
| Import alias         | `@/*`                                                                           |
| Database             | [Neon](https://neon.tech/) (Serverless Postgres)                                |
| ORM                  | [Drizzle ORM](https://orm.drizzle.team/)                                        |
| Testing              | [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/) |
| Formatter (MD/HTML)  | [Prettier](https://prettier.io/) (tabs, 80 col)                                 |
| Node version manager | [Volta](https://volta.sh/)                                                      |
| Editor               | [Zed](https://zed.dev/) settings included                                       |

### Available Scripts

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
| `npm run typecheck`   | TypeScript type check (no emit)         |
| `npm run verify`      | Run tests + lint:fix + typecheck in one |
