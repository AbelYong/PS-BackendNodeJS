import { defineConfig } from "drizzle-kit"
import * as dotenv from "dotenv"

dotenv.config();

export default defineConfig({
    dialect: "mysql",
    schema: "./src/drizzle/schema.ts",
    out: "./drizzle/migrations/",
    dbCredentials: {
        url: process.env["DB_ROOT_URL"] as string
    },
    strict: true,
    verbose: true
});
