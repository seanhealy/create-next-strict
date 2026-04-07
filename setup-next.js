#!/usr/bin/env node

/**
 * Next.js Setup Script Configuration
 *
 * Edit this config to customize what changes the script makes
 */

// create-next-app scaffolding command
const CREATE_NEXT_APP_CMD =
	"npx create-next-app@latest . --ts --biome --react-compiler --no-tailwind --src-dir --app --import-alias @/*";

// File name convention: files containing this marker get appended to the target
// e.g. "README.append.md" → append content to "README.md"
const APPEND_MARKER = ".append.";

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
		vitest: "latest",
		jsdom: "latest",
		"@vitejs/plugin-react": "latest",
		"@testing-library/react": "latest",
		"@testing-library/user-event": "latest",
		"@testing-library/jest-dom": "latest",
	},

	// Directory containing template files to copy into the project.
	// The directory structure mirrors the output paths.
	templatesDir: "templates",

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
			packageJson.scripts.test = "vitest run";
			packageJson.scripts["test:watch"] = "vitest";

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

};

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

// Resolve the templates directory relative to the script location
const scriptDir = path.dirname(new URL(import.meta.url).pathname);
const templatesDir = path.join(scriptDir, SETUP_CONFIG.templatesDir);

// Recursively walk a directory and return all file paths (relative to root)
function walkDir(dir, root = dir) {
	const entries = fs.readdirSync(dir, { withFileTypes: true });
	const files = [];
	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			files.push(...walkDir(fullPath, root));
		} else {
			files.push(path.relative(root, fullPath));
		}
	}
	return files;
}

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run") || args.includes("-d");
const showHelp = args.includes("--help") || args.includes("-h");

// Auto-detect: scaffold if no package.json exists
const initMode = !fs.existsSync("package.json");

if (showHelp) {
	console.log(`Next.js Setup Script

Sets up a new Next.js project with opinionated strict defaults.

Automatically detects context:
- Empty directory (no package.json) → scaffolds with create-next-app, then
  applies strict defaults
- Existing project (has package.json) → applies strict defaults only

What it does:
- Scaffolds a Next.js project: TypeScript, Biome, React Compiler,
  CSS Modules, src/ directory, App Router
- Installs Vitest + Testing Library for unit/component testing
- Installs Prettier with tab-based config for MD/HTML only
- Installs Drizzle ORM + Neon PostgreSQL with repository pattern
- Updates biome.json to use tabs and add property sorting
- Adds Volta to manage node/npm versions
- Creates Zed editor settings for Biome integration

Usage:
  create-next-strict              Run setup (scaffold if needed + apply defaults)
  create-next-strict --dry-run    Preview changes without applying
  create-next-strict --help       Show this help

Options:
  --dry-run, -d    Show what would be changed without making changes
  --help, -h       Show this help message

Examples:
  # Full setup: scaffold a new project in the current directory, then customize
  mkdir my-app && cd my-app
  npx create-next-strict

  # Just apply customizations to an existing Next.js project
  cd existing-app
  npx create-next-strict

  # Preview what would happen
  npx create-next-strict --dry-run`);
	process.exit(0);
}

if (isDryRun) {
	console.log("🔍 DRY RUN MODE - No changes will be made\n");
}

console.log("🚀 Starting Next.js setup...\n");

// Step 0: Scaffold project with create-next-app (if no package.json)
if (initMode) {
	console.log("🏗️  No package.json found — scaffolding Next.js project...");

	if (isDryRun) {
		console.log(`📝 Would run: ${CREATE_NEXT_APP_CMD}`);
	} else {
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
} else {
	console.log("📦 Found existing package.json — applying strict defaults...\n");
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
const pkgs = Object.entries(SETUP_CONFIG.packages)
	.map(([pkg, version]) => `${pkg}@${version}`)
	.join(" ");
if (pkgs) {
	safeExecCommand(`npm i ${pkgs}`, "Dependencies installed successfully");
}
const devPkgs = Object.entries(SETUP_CONFIG.devPackages)
	.map(([pkg, version]) => `${pkg}@${version}`)
	.join(" ");
if (devPkgs) {
	safeExecCommand(
		`npm i -D ${devPkgs}`,
		"Dev dependencies installed successfully",
	);
}
console.log();

// Step 2: Apply template files
console.log("📝 Applying template files...");
const templateFiles = walkDir(templatesDir);
for (const filePath of templateFiles) {
	const content = fs.readFileSync(path.join(templatesDir, filePath), "utf8");

	if (filePath.includes(APPEND_MARKER)) {
		const targetPath = filePath.replace(APPEND_MARKER, ".");
		const targetExists = fs.existsSync(targetPath);

		if (isDryRun) {
			if (targetExists || initMode) {
				console.log(`📝 Would append to ${targetPath}`);
			} else {
				console.log(`📝 Would create ${targetPath}`);
			}
		} else if (targetExists) {
			const originalContent = fs.readFileSync(targetPath, "utf8");
			const newContent = `${originalContent.trimEnd()}\n\n${content}`;
			safeWriteFile(targetPath, newContent, `Appended to ${targetPath}`);
		} else {
			safeWriteFile(targetPath, content, `Created ${targetPath}`);
		}
	} else {
		safeWriteFile(filePath, content, `Created ${filePath}`);
	}
}
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

// Step 7: Run tests to verify setup
if (!isDryRun) {
	console.log("🧪 Running tests to verify setup...");
	try {
		execSync("npm run test", { stdio: "inherit" });
		console.log("✅ All tests pass");
	} catch (_error) {
		console.warn("⚠️  Tests completed with failures — review output above");
	}
	console.log();
} else {
	console.log("🧪 Would run: npm run test\n");
}

// Step 8: Summary
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
const fileNames = templateFiles.filter((f) => !f.includes(APPEND_MARKER));
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
templateFiles
	.filter((f) => f.includes(APPEND_MARKER))
	.forEach((f) => {
		console.log(`  • Appended to ${f.replace(APPEND_MARKER, ".")}`);
	});
if (SETUP_CONFIG.symlinks) {
	Object.entries(SETUP_CONFIG.symlinks).forEach(([target, links]) => {
		for (const link of links) {
			console.log(`  • Symlinked ${link} -> ${target}`);
		}
	});
}

if (!isDryRun) {
	console.log("\n💡 You can now run:");
	console.log("  • npm run dev (start dev server)");
} else {
	console.log("\n💡 To apply these changes, run:");
	console.log("  npx create-next-strict");
}
