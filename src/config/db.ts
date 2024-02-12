import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2";
import * as schema from "../db/schema/user.js";

export const connection = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "root",
  database: "ecom-api",
  port: 3306,
  multipleStatements: true,
});

export const db = drizzle(connection, { mode: "default", schema });
