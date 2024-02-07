import "dotenv/config";
import type { Config } from "drizzle-kit";

export default {
  schema: "./db/schema.ts",
  out: "./drizzle",
  driver: "mysql2", // 'pg' | 'mysql2' | 'better-sqlite' | 'libsql' | 'turso'
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
