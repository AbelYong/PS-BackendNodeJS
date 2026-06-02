import { drizzle } from "drizzle-orm/mysql2";
import { relations } from "./relations.js";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = await mysql.createConnection({
    host: process.env["DB_HOST"] as string,
    port: Number(process.env["DB_PORT"]),
    user: process.env["DB_USER"] as string,
    password: process.env["DB_PASSWORD"] as string,
    database: process.env["DB_DATABASE"] as string,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

pool.on('error', (err: any) => {
    console.error('Error crítico en el pool de MySQL:', err.message);
});

export const db = drizzle({ 
    client: pool,
    relations: relations
});

export type DbClient = typeof db;
