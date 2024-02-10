import { users } from "../db/schema.js";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const insertUserSchema = createInsertSchema(users, {
  email: (e) => e.email.email("Invalid Email"),
  password: (e) => e.password.min(6, "Password must be at least 6 characters long"),
});

export type UserInfo = Omit<z.infer<typeof insertUserSchema>, "password">;
