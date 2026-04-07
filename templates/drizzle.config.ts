import { defineConfig } from "drizzle-kit";

import { assertValue } from "@/utilities/assertValue";

export default defineConfig({
	dialect: "postgresql",
	schema: "./src/db/schema.ts",
	out: "./drizzle",
	dbCredentials: {
		url: assertValue(process.env.DATABASE_URL, "DATABASE_URL is not set"),
	},
});
