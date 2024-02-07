import { migrate } from "drizzle-orm/mysql2/migrator";
import mysql2 from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";

const con = await mysql2.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "ecom-api",
  port: 3306,
  multipleStatements: true,
});

const db = drizzle(con);
await migrate(db, { migrationsFolder: "drizzle" });
await con.end();
