import { MySqlContainer } from "@testcontainers/mysql";
import { drizzle } from "drizzle-orm/mysql2";
import { migrate } from "drizzle-orm/mysql2/migrator";
import mysql from "mysql2/promise";
import type { TestProject } from "vitest/node";

export default async function setup(project: TestProject) {
    const container = await new MySqlContainer("mysql:8.0")
        .withDatabase("PS_DB")
        .withRootPassword("PS_PASS")
        .start();

    const dbConfig = {
        host: container.getHost(),
        port: container.getPort(),
        database: container.getDatabase(),
        user: "root",
        password: container.getRootPassword(),
    };

    project.provide("dbConfig", dbConfig);

    const migrationClient = await mysql.createConnection({
        ...dbConfig,
        multipleStatements: true, 
    });
    
    const db = drizzle({ client: migrationClient });
    
    await migrate(db, { migrationsFolder: "./drizzle/migrations" });
    await migrationClient.end();

    return async () => {
        await container.stop();
    };
}
