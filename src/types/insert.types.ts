import { users } from "../db/schema.js";
import { createInsertSchema } from "drizzle-zod";

export const insertUser = createInsertSchema(users, {
  email: (e) => e.email.email("Invalid Email"),
  password: (e) => e.password.min(6, "Password must be at least 6 characters long"),
});
