import { drizzle } from "drizzle-orm/mysql2";
import { relations } from "./relations.js";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const connection = await mysql.createConnection({
    host: process.env["DB_HOST"] as string,
    user: process.env["DB_USER"] as string,
    password: process.env["DB_PASSWORD"] as string,
    database: process.env["DB_DATABASE"] as string
});

export const db = drizzle({ 
    client: connection,
    relations: relations
});

export type DbClient = typeof db;
