import { relations } from "drizzle-orm";
import { datetime, text, mysqlTable, varchar } from "drizzle-orm/mysql-core";

import { ulid } from "ulidx";

export const users = mysqlTable("users", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => ulid()),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  created_at: datetime("created_at", { mode: "date" })
    .notNull()
    .$defaultFn(() => new Date()),
  updated_at: datetime("updated_at", { mode: "date" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const tokens = mysqlTable("tokens", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => ulid()),
  token: text("token").notNull(),
  user_id: varchar("user_id", { length: 255 }).references(() => users.id),
  expires_at: datetime("expires_at", { mode: "date" }).notNull(),
  created_at: datetime("created_at", { mode: "date" })
    .notNull()
    .$defaultFn(() => new Date()),
  updated_at: datetime("updated_at", { mode: "date" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const userRelations = relations(users, ({ many }) => ({
  tokens: many(tokens),
}));

export const userTokenRelations = relations(tokens, ({ one }) => ({
  user: one(users, {
    fields: [tokens.user_id],
    references: [users.id],
  }),
}));
