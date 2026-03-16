#!/usr/bin/env node

/**
 * Next.js Setup Script Configuration
 *
 * Edit this config to customize what changes the script makes
 */

// create-next-app scaffolding command (used with --init)
const CREATE_NEXT_APP_CMD =
	"npx create-next-app@latest . --ts --biome --react-compiler --no-tailwind --src-dir --app --import-alias @/*";

const SETUP_CONFIG = {
	// NPM packages to install (production dependencies)
	packages: {
		"drizzle-orm": "latest",
		"@neondatabase/serverless": "latest",
	},

	// NPM packages to install (dev dependencies)
	devPackages: {
		prettier: "latest",
		"drizzle-kit": "latest",
	},

	// Files to create
	filesToCreate: {
		".prettierrc.cjs": `
			/** @type {import("prettier").Config} */
			const config = {
				useTabs: true,
				proseWrap: "always",
				printWidth: 80,
			};

			module.exports = config;
		`,
		".prettierignore": `
			# Ignore everything by default
			*

			# But don't ignore markdown files
			!*.md
			!**/*.md

			# But don't ignore HTML files
			!*.html
			!**/*.html

			# Don't ignore directories (needed for pattern matching to work)
			!*/
		`,
		".zed/settings.json": `
			// Folder-specific settings
			//
			// For a full list of overridable settings, and general information on folder-specific settings,
			// see the documentation: https://zed.dev/docs/configuring-zed#settings-files
			{
				"code_actions_on_format": {
					"source.fixAll.biome": true,
					"source.fixAll.prettier": true
				},
				"languages": {
					"JavaScript": { "formatter": { "language_server": { "name": "biome" } } },
					"TypeScript": { "formatter": { "language_server": { "name": "biome" } } },
					"TSX": { "formatter": { "language_server": { "name": "biome" } } },
					"JSON": { "formatter": { "language_server": { "name": "biome" } } },
					"JSONC": { "formatter": { "language_server": { "name": "biome" } } },
					"CSS": { "formatter": { "language_server": { "name": "biome" } } },
					"GraphQL": { "formatter": { "language_server": { "name": "biome" } } }
				}
			}
		`,
		"src/db/schema.ts": `
			// Define your database tables here.
			// See https://orm.drizzle.team/docs/sql-schema-declaration

			// Example:
			// import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
			//
			// export const users = pgTable("users", {
			// 	id: serial("id").primaryKey(),
			// 	name: text("name").notNull(),
			// 	email: text("email").notNull().unique(),
			// 	createdAt: timestamp("created_at").defaultNow().notNull(),
			// });
		`,
		"src/db/index.ts": `
			import { neon } from "@neondatabase/serverless";
			import { drizzle } from "drizzle-orm/neon-http";

			import * as schema from "./schema";

			const sql = neon(process.env.DATABASE_URL!);

			export const db = drizzle(sql, { schema });
		`,
		"src/db/repositories/index.ts": `
			// Barrel export for all repositories.
			//
			// As you add repositories, re-export them here:
			// export { UserRepository } from "./users";

			export { ExampleRepository } from "./example";
		`,
		"src/db/repositories/example.ts": `
			import { sql } from "drizzle-orm";

			import { db } from "@/db";

			/**
			 * Example repository demonstrating the repository pattern.
			 *
			 * Each repository encapsulates all database interactions for a
			 * specific domain. Replace this with real repositories as you
			 * build out your schema.
			 */
			export const ExampleRepository = {
				/** Verify the database connection is working. */
				async healthCheck(): Promise<{ now: Date }> {
					const result = await db.execute(
						sql\`SELECT NOW() as now\`,
					);
					return { now: result.rows[0].now as Date };
				},
			};
		`,
		"src/utilities/assertValue.ts": `
			export function assertValue<T>(value: T | undefined, errorMessage: string): T {
				if (value === undefined) {
					throw new Error(errorMessage);
				}

				return value;
			}
		`,
		"src/utilities/assertValue.test.ts": `
			import { assertValue } from "./assertValue";

			describe("assertValue", () => {
				it("should return the value if it is not undefined", () => {
					const value = "value";
					expect(assertValue(value, "error")).toBe(value);
				});

				it("should throw an error if the value is undefined", () => {
					expect(() => assertValue(undefined, "error")).toThrowError("error");
				});
			});
		`,
		"drizzle.config.ts": `
			import { defineConfig } from "drizzle-kit";

			export default defineConfig({
				dialect: "postgresql",
				schema: "./src/db/schema.ts",
				out: "./drizzle",
				dbCredentials: {
					url: process.env.DATABASE_URL!,
				},
			});
		`,
		".env.example": `
			# Database — Neon PostgreSQL connection string
			# Get yours at https://neon.tech
			DATABASE_URL=postgresql://user:password@host/database?sslmode=require
		`,
		"AGENTS.md": `
			# AGENTS.md

			## Tech Stack

			- **Framework:** [Next.js](https://nextjs.org/) (App Router)
			- **Language:** TypeScript
			- **Database:** [Neon](https://neon.tech/) (Serverless Postgres)
			- **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
			- **Linter/Formatter:** [Biome](https://biomejs.dev/) for JS/TS/CSS/JSON
			- **Formatter (MD/HTML):** [Prettier](https://prettier.io/)
			- **Node version manager:** [Volta](https://volta.sh/)

			## Project Structure

			This project uses the \`src/\` directory layout with the App Router:

			\`\`\`
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
			\`\`\`

			## Component Organization

			- Use **design system patterns** — build a consistent library of reusable,
			  composable UI components with clear props interfaces rather than
			  one-off inline markup.
			- **Global components** shared across multiple pages go in
			  \`src/app/components/\`.
			- **Scoped components** that are only relevant to a single page or
			  parent component go in a \`components/\` directory colocated with
			  that page or component.

			## Database & Repository Pattern

			- All database interactions go through **repositories** in
			  \`src/db/repositories/\`.
			- Each repository encapsulates queries for a specific domain
			  (e.g., \`UserRepository\`, \`PostRepository\`).
			- Never import \`db\` directly in route handlers or components —
			  always go through a repository.
			- Define tables in \`src/db/schema.ts\` using Drizzle's schema API.
			- Use \`npm run db:generate\` to create migrations after schema
			  changes, then \`npm run db:migrate\` to apply them.

			## Coding Conventions

			- **Indentation:** Tabs (not spaces)
			- **Line width:** 80 columns
			- **Import alias:** \`@/*\` maps to \`src/*\`
			- **Imports:** Auto-organized by Biome
			- **Object properties:** Auto-sorted by Biome
			- Prefer named exports over default exports (except for pages/layouts)
			- Use \`function\` declarations for components, not arrow functions

			## Commands

			| Command | Description |
			| --- | --- |
			| \`npm run dev\` | Start dev server (Turbopack) |
			| \`npm run build\` | Production build |
			| \`npm run start\` | Start production server |
			| \`npm run lint\` | Check with Biome + Prettier |
			| \`npm run format\` | Auto-fix with Biome |
			| \`npm run lint:fix\` | Auto-fix with Biome + Prettier |
			| \`npm run db:generate\` | Generate migrations from schema |
			| \`npm run db:migrate\` | Run pending migrations |
			| \`npm run db:push\` | Push schema directly (dev shortcut) |
			| \`npm run db:studio\` | Open Drizzle Studio (visual DB browser) |

			## Before Submitting Changes

			1. Run \`npm run lint:fix\` to auto-format and fix lint issues
			2. Run \`npm run build\` to verify the project compiles without errors
		`,
	},

	// JSON file modifications
	jsonModifications: {
		"biome.json": (config) => {
			// Update formatter settings
			config.formatter = {
				...config.formatter,
				indentStyle: "tab",
				lineWidth: 80,
			};

			// Ensure assist structure exists and add properties
			if (!config.assist) config.assist = {};
			if (!config.assist.actions) config.assist.actions = {};
			if (!config.assist.actions.source) config.assist.actions.source = {};

			config.assist.actions.source = {
				...config.assist.actions.source,
				organizeImports: "on",
				useSortedProperties: "on",
			};

			return config;
		},

		// Package.json modifications
		"package.json": (packageJson) => {
			// Update scripts
			if (!packageJson.scripts) packageJson.scripts = {};
			packageJson.scripts.lint = "biome check && prettier --check .";
			packageJson.scripts.format = "biome check --write";
			packageJson.scripts["lint:fix"] =
				"biome check --write && prettier --write .";
			packageJson.scripts["db:generate"] = "drizzle-kit generate";
			packageJson.scripts["db:migrate"] = "drizzle-kit migrate";
			packageJson.scripts["db:push"] = "drizzle-kit push";
			packageJson.scripts["db:studio"] = "drizzle-kit studio";

			// Update volta configuration
			if (!packageJson.volta) packageJson.volta = {};
			packageJson.volta.node = "24.10.0";
			packageJson.volta.npm = "11.6.2";

			return packageJson;
		},
	},

	// Symlinks to create (target -> link path)
	// These are relative symlinks so they work in any checkout location
	symlinks: {
		"AGENTS.md": ["CLAUDE.md", ".github/copilot-instructions.md"],
	},

	// Content to append to README.md
	readmeAppend: `
		## Project Setup

		This project was scaffolded with
		[\`create-next-app\`](https://nextjs.org/docs/app/api-reference/cli/create-next-app)
		and customized with
		\`setup-next.js\` using the following choices:

		| Category | Choice |
		| --- | --- |
		| Language | TypeScript |
		| Linter | [Biome](https://biomejs.dev/) |
		| React Compiler | Enabled |
		| CSS | CSS Modules (Tailwind opt-out) |
		| Project structure | \`src/\` directory |
		| Router | App Router |
		| Import alias | \`@/*\` |
		| Database | [Neon](https://neon.tech/) (Serverless Postgres) |
		| ORM | [Drizzle ORM](https://orm.drizzle.team/) |
		| Formatter (MD/HTML) | [Prettier](https://prettier.io/) (tabs, 80 col) |
		| Node version manager | [Volta](https://volta.sh/) |
		| Editor | [Zed](https://zed.dev/) settings included |

		### Available Scripts

		| Command | Description |
		| --- | --- |
		| \`npm run dev\` | Start dev server (Turbopack) |
		| \`npm run build\` | Production build |
		| \`npm run start\` | Start production server |
		| \`npm run lint\` | Check with Biome + Prettier |
		| \`npm run format\` | Auto-fix with Biome |
		| \`npm run lint:fix\` | Auto-fix with Biome + Prettier |
		| \`npm run db:generate\` | Generate migrations from schema |
		| \`npm run db:migrate\` | Run pending migrations |
		| \`npm run db:push\` | Push schema directly (dev shortcut) |
		| \`npm run db:studio\` | Open Drizzle Studio (visual DB browser) |
	`,
};

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

// Helper function to remove indentation from template literals
function dedent(str) {
	const lines = str.split("\n");

	// Remove leading/trailing empty lines
	while (lines.length && !lines[0].trim()) lines.shift();
	while (lines.length && !lines[lines.length - 1].trim()) lines.pop();

	if (!lines.length) return "";

	// Find minimum indentation (excluding empty lines)
	const minIndent = Math.min(
		...lines
			.filter((line) => line.trim())
			.map((line) => line.match(/^\s*/)[0].length),
	);

	// Remove common indentation
	return lines.map((line) => line.slice(minIndent)).join("\n");
}

// Parse command line arguments
const args = process.argv.slice(2);
const writeMode = args.includes("--write") || args.includes("-w");
const initMode = args.includes("--init") || args.includes("-i");
const isDryRun =
	args.includes("--dry-run") || args.includes("-d") || !writeMode;
const showHelp = args.includes("--help") || args.includes("-h");

// Show help by default if no args or if help is requested
const shouldShowHelp = showHelp || args.length === 0;

if (shouldShowHelp) {
	console.log(`Next.js Setup Script

Sets up a new Next.js project with opinionated defaults, or applies
modifications to an existing Next.js project.

What it does:
- Scaffolds a Next.js project (with --init): TypeScript, Biome, React
  Compiler, CSS Modules, src/ directory, App Router
- Installs prettier with tab-based config for MD/HTML only
- Updates biome.json to use tabs and add property sorting
- Updates lint/lint:fix scripts to include prettier
- Adds volta to manage node/npm versions
- Creates Zed editor settings for Biome integration

Usage:
  create-next-strict              Show this help (default)
  create-next-strict --write      Apply modifications only
  create-next-strict --init --write   Scaffold project + apply modifications
  create-next-strict --dry-run    Preview changes without applying
  create-next-strict --help       Show this help

Options:
  --write, -w      Apply changes (required to make actual modifications)
  --init, -i       Scaffold a new Next.js project first (via create-next-app)
  --dry-run, -d    Show what would be changed without making changes
  --help, -h       Show this help message

Examples:
  # Full setup: scaffold a new project in the current directory, then customize
  create-next-strict --init --write

  # Just apply customizations to an existing Next.js project
  create-next-strict --write

  # Preview what --init --write would do without making changes
  create-next-strict --init --dry-run`);
	process.exit(0);
}

if (isDryRun) {
	console.log("🔍 DRY RUN MODE - No changes will be made\n");
}

console.log("🚀 Starting Next.js setup...\n");

// Step 0: Scaffold project with create-next-app (if --init)
if (initMode) {
	console.log("🏗️  Scaffolding Next.js project...");

	if (isDryRun) {
		console.log(`📝 Would run: ${CREATE_NEXT_APP_CMD}`);
	} else {
		// Check if directory already has a package.json (safety check)
		if (fs.existsSync("package.json")) {
			console.error("❌ package.json already exists in the current directory.");
			console.error(
				"   --init is intended for empty directories. Remove package.json or run without --init.",
			);
			process.exit(1);
		}

		try {
			console.log(`🔧 Running: ${CREATE_NEXT_APP_CMD}`);
			execSync(CREATE_NEXT_APP_CMD, { stdio: "inherit" });
			console.log("✅ Next.js project scaffolded successfully");
		} catch (error) {
			console.error("❌ Failed to scaffold Next.js project:", error.message);
			process.exit(1);
		}
	}

	console.log();
}

console.log("🔧 Applying modifications...\n");

// Helper function to show what would be changed
function showDiff(filePath, oldContent, newContent) {
	const verb = isDryRun ? "Would modify" : "Modified";
	console.log(`📝 ${verb} ${filePath}:`);

	const oldLines = oldContent.split("\n");
	const newLines = newContent.split("\n");

	// Simple line-by-line diff
	const maxLines = Math.max(oldLines.length, newLines.length);

	for (let i = 0; i < maxLines; i++) {
		const oldLine = oldLines[i] || "";
		const newLine = newLines[i] || "";

		if (oldLine !== newLine) {
			if (oldLine && !newLine) {
				console.log(`\x1b[31m- ${oldLine}\x1b[0m`);
			} else if (!oldLine && newLine) {
				console.log(`\x1b[32m+ ${newLine}\x1b[0m`);
			} else {
				console.log(`\x1b[31m- ${oldLine}\x1b[0m`);
				console.log(`\x1b[32m+ ${newLine}\x1b[0m`);
			}
		} else if (oldLine) {
			console.log(`  ${oldLine}`);
		}
	}

	console.log("---\n");
}

// Helper function to show JSON diffs more meaningfully
function showJsonDiff(filePath, oldJson, newJson) {
	const verb = isDryRun ? "Would modify" : "Modified";
	console.log(`📝 ${verb} ${filePath}:`);

	// Show only the meaningful changes
	showJsonChanges("", oldJson, newJson);

	console.log("---\n");
}

// Recursive function to show JSON changes
function showJsonChanges(path, oldObj, newObj) {
	const oldKeys = new Set(Object.keys(oldObj || {}));
	const newKeys = new Set(Object.keys(newObj || {}));
	const allKeys = new Set([...oldKeys, ...newKeys]);

	for (const key of allKeys) {
		const currentPath = path ? `${path}.${key}` : key;
		const oldValue = oldObj?.[key];
		const newValue = newObj?.[key];

		if (!oldKeys.has(key)) {
			// Added
			console.log(
				`\x1b[32m+ ${currentPath}: ${JSON.stringify(newValue)}\x1b[0m`,
			);
		} else if (!newKeys.has(key)) {
			// Removed
			console.log(
				`\x1b[31m- ${currentPath}: ${JSON.stringify(oldValue)}\x1b[0m`,
			);
		} else if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
			// Changed
			if (
				typeof oldValue === "object" &&
				typeof newValue === "object" &&
				!Array.isArray(oldValue) &&
				!Array.isArray(newValue)
			) {
				// Recurse for nested objects
				showJsonChanges(currentPath, oldValue, newValue);
			} else {
				console.log(
					`\x1b[31m- ${currentPath}: ${JSON.stringify(oldValue)}\x1b[0m`,
				);
				console.log(
					`\x1b[32m+ ${currentPath}: ${JSON.stringify(newValue)}\x1b[0m`,
				);
			}
		}
	}
}

// Helper function to safely write file
function safeWriteFile(filePath, content, description, originalContent = null) {
	// Show diffs for modifications
	if (originalContent) {
		// For JSON files, do a more meaningful comparison
		if (filePath.endsWith(".json")) {
			try {
				const oldJson = JSON.parse(originalContent);
				const newJson = JSON.parse(content);
				showJsonDiff(filePath, oldJson, newJson);
			} catch (_e) {
				showDiff(filePath, originalContent, content);
			}
		} else {
			showDiff(filePath, originalContent, content);
		}
	} else if (isDryRun) {
		console.log(
			`📝 Would ${description.toLowerCase().replace("created", "create").replace("updated", "update")}`,
		);
	}

	if (isDryRun) {
		return;
	}

	try {
		// Create parent directories if they don't exist
		const dir = path.dirname(filePath);
		if (dir !== "." && !fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true });
		}

		// Ensure content ends with a newline
		const contentWithNewline = content.endsWith("\n")
			? content
			: `${content}\n`;
		fs.writeFileSync(filePath, contentWithNewline);
		console.log(`✅ ${description}`);
	} catch (error) {
		console.error(`❌ Failed to write ${filePath}:`, error.message);
		throw error;
	}
}

// Helper function to safely run command
function safeExecCommand(command, description) {
	console.log(`🔧 Running: ${command}`);

	if (isDryRun) {
		console.log(`📝 Would run: ${command}`);
		return;
	}

	try {
		execSync(command, { stdio: "inherit" });
		console.log(`✅ ${description}`);
	} catch (error) {
		console.error(`❌ Failed to run command: ${command}`);
		throw error;
	}
}

// Helper function to safely modify JSON file
function safeModifyJsonFile(filePath, modifyFn, description) {
	if (!fs.existsSync(filePath)) {
		console.log(`⚠️  ${filePath} not found, skipping ${description}`);
		return;
	}

	try {
		const originalContent = fs.readFileSync(filePath, "utf8");
		const jsonData = JSON.parse(originalContent);

		// Apply modifications
		const modifiedData = modifyFn(jsonData);
		const newContent = JSON.stringify(modifiedData, null, 2);

		safeWriteFile(filePath, newContent, description, originalContent);
	} catch (error) {
		console.error(`❌ Failed to modify ${filePath}:`, error.message);
		if (!isDryRun) process.exit(1);
	}
}

// Step 1: Install packages
console.log("📦 Installing packages...");
Object.entries(SETUP_CONFIG.packages).forEach(([pkg, version]) => {
	safeExecCommand(`npm i ${pkg}@${version}`, `${pkg} installed successfully`);
});
Object.entries(SETUP_CONFIG.devPackages).forEach(([pkg, version]) => {
	safeExecCommand(
		`npm i -D ${pkg}@${version}`,
		`${pkg} installed successfully (dev)`,
	);
});
console.log();

// Step 2: Create config files
console.log("📝 Creating configuration files...");
Object.entries(SETUP_CONFIG.filesToCreate).forEach(([filePath, content]) => {
	safeWriteFile(filePath, dedent(content), `Created ${filePath}`);
});
console.log();

// Step 3: Modify JSON config files
console.log("⚙️  Modifying JSON config files...");
Object.entries(SETUP_CONFIG.jsonModifications).forEach(
	([filePath, modifyFn]) => {
		const fileName = filePath.split("/").pop();
		safeModifyJsonFile(filePath, modifyFn, `Updated ${fileName}`);
	},
);
console.log();

// Step 4: Append to README.md
if (SETUP_CONFIG.readmeAppend) {
	console.log("📄 Updating README.md...");
	const readmePath = "README.md";
	const appendContent = dedent(SETUP_CONFIG.readmeAppend);
	const readmeExists = fs.existsSync(readmePath);

	if (isDryRun) {
		if (readmeExists || initMode) {
			// README exists now, or would exist after create-next-app
			console.log("📝 Would append to README.md:");
		} else {
			console.log("📝 Would create README.md:");
		}
		console.log(appendContent);
	} else if (readmeExists) {
		const originalContent = fs.readFileSync(readmePath, "utf8");
		const newContent = `${originalContent.trimEnd()}\n\n${appendContent}`;
		safeWriteFile(readmePath, newContent, "Updated README.md", originalContent);
	} else {
		safeWriteFile(readmePath, appendContent, "Created README.md");
	}
	console.log();
}

// Step 5: Create symlinks
if (SETUP_CONFIG.symlinks) {
	console.log("🔗 Creating symlinks...");
	Object.entries(SETUP_CONFIG.symlinks).forEach(([target, links]) => {
		for (const link of links) {
			if (isDryRun) {
				console.log(`📝 Would symlink ${link} -> ${target}`);
			} else {
				try {
					// Create parent directories if they don't exist
					const dir = path.dirname(link);
					if (dir !== "." && !fs.existsSync(dir)) {
						fs.mkdirSync(dir, { recursive: true });
					}

					// Remove existing file/symlink if it exists
					if (fs.existsSync(link)) {
						fs.unlinkSync(link);
					}

					// Compute relative path from link location to target
					const relativePath = path.relative(path.dirname(link), target);
					fs.symlinkSync(relativePath, link);
					console.log(`✅ Symlinked ${link} -> ${target}`);
				} catch (error) {
					console.error(
						`❌ Failed to symlink ${link} -> ${target}:`,
						error.message,
					);
				}
			}
		}
	});
	console.log();
}

// Step 6: Run lint:fix to ensure clean state
if (!isDryRun) {
	console.log("🧹 Running lint:fix to ensure clean state...");
	try {
		execSync("npm run lint:fix", { stdio: "inherit" });
		console.log("✅ Project is in a clean lint state");
	} catch (_error) {
		console.warn("⚠️  lint:fix completed with warnings — review output above");
	}
	console.log();
} else {
	console.log("🧹 Would run: npm run lint:fix\n");
}

// Step 7: Summary
if (isDryRun) {
	console.log("🔍 PREVIEW COMPLETED - No actual changes were made\n");
	console.log("📝 Would make these changes:");
} else {
	console.log("🎉 All modifications completed successfully!\n");
	console.log("📝 Summary of changes:");
}

// Generate summary from config
const packageNames = [
	...Object.keys(SETUP_CONFIG.packages),
	...Object.keys(SETUP_CONFIG.devPackages),
];
const fileNames = Object.keys(SETUP_CONFIG.filesToCreate);
const jsonFiles = Object.keys(SETUP_CONFIG.jsonModifications);

if (initMode) {
	console.log(
		"  • Scaffolded Next.js project (TS, Biome, CSS Modules, React Compiler, App Router, src/)",
	);
}
console.log(`  • Installed ${packageNames.join(", ")}`);
fileNames.forEach((file) => {
	console.log(`  • Created ${file}`);
});
jsonFiles.forEach((file) => {
	console.log(`  • Updated ${file}`);
});
if (SETUP_CONFIG.readmeAppend) {
	console.log("  • Updated README.md with project setup documentation");
}
if (SETUP_CONFIG.symlinks) {
	Object.entries(SETUP_CONFIG.symlinks).forEach(([target, links]) => {
		for (const link of links) {
			console.log(`  • Symlinked ${link} -> ${target}`);
		}
	});
}

if (writeMode) {
	console.log("\n💡 You can now run:");
	console.log("  • npm run dev (start dev server)");
} else {
	console.log("\n💡 To apply these changes, run:");
	console.log("  create-next-strict --write");
}
