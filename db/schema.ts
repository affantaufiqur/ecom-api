import { int, mysqlTable, varchar } from "drizzle-orm/mysql-core";

export const randomUser = mysqlTable("random_user", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 256 }).notNull(),
});

export const testing = mysqlTable("testing", {
  id: int("id").primaryKey().autoincrement(),
  pub: varchar("pub", { length: 256 }).notNull(),
  address: varchar("address", { length: 256 }).notNull(),
  phone_number: varchar("phone_number", { length: 256 }).notNull(),
  table_id: int("table_id").references(() => randomUser.id),
});
