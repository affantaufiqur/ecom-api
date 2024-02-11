import { migrate } from "drizzle-orm/mysql2/migrator";
import { createConnection } from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";

try {
  const connection = await createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "ecom-api",
    port: 3306,
    multipleStatements: true,
  });
  const db = drizzle(connection);
  await migrate(db, { migrationsFolder: "src/drizzle" });
  await connection.end();
} catch (err) {
  console.log(err);
}
