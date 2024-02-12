import { datetime, int, mysqlTable, float, varchar } from "drizzle-orm/mysql-core";
import { ulid } from "ulidx";
import { users } from "./user";

export const products = mysqlTable("products", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => ulid()),
  name: varchar("name", { length: 255 }).notNull(),
  price: float("price").notNull().default(0),
  quanity: int("quantity").notNull().default(0),
  description: varchar("description", { length: 255 }).notNull(),
  seller_id: varchar("seller_id", { length: 255 }).references(() => users.id),
  created_at: datetime("created_at", { mode: "date" })
    .notNull()
    .$defaultFn(() => new Date()),
  updated_at: datetime("updated_at", { mode: "date" })
    .notNull()
    .$defaultFn(() => new Date()),
});
