import { users } from "../db/schema/user.js";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const insertUserSchema = createInsertSchema(users, {
  email: (e) => e.email.email("Invalid Email"),
  password: (e) => e.password.min(6, "Password must be at least 6 characters long"),
  role: (e) =>
    e.role.pipe(
      z.enum(["regular_user", "seller"], { required_error: "Role is required", invalid_type_error: "Invalid role" }),
    ),
  role_level: (e) => e.role_level.optional(),
});

export const loginUserSchema = createInsertSchema(users, {
  email: (e) => e.email.email("Invalid Email"),
  password: (e) => e.password.min(6, "Password must be at least 6 characters long"),
  role: (e) => e.role.optional(),
  role_level: (e) => e.role_level.optional(),
});

// used in express.d.ts
export type UserInfo = Omit<z.infer<typeof insertUserSchema>, "password">;
