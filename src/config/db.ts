import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2";

export const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "ecom-api",
  port: 3306,
  multipleStatements: true,
});

export const db = drizzle(connection, { mode: "default" });
