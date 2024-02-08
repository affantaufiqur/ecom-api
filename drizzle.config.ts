import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema.ts",
  out: "./src/drizzle",
  driver: "mysql2",
  dbCredentials: {
    host: "localhost",
    user: "root",
    password: "root",
    database: "ecom-api",
    port: 3306,
  },
  verbose: true,
  strict: true,
} satisfies Config;
