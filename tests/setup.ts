import { inject } from "vitest";

const dbConfig = inject("dbConfig");

process.env["DB_HOST"] = String(dbConfig["host"]);
process.env["DB_PORT"] = String(dbConfig["port"]);
process.env["DB_USER"] = String(dbConfig["user"]);
process.env["DB_PASSWORD"] = String(dbConfig["password"]);
process.env["DB_DATABASE"] = String(dbConfig["database"]);
