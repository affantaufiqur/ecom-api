import { z } from "zod";

export const insertUserSchema = z.object({
  email: z
    .string({ required_error: "Email is required", invalid_type_error: "Invalid email" })
    .min(1, "Email is required")
    .email(),
  password: z
    .string({ required_error: "Password is required", invalid_type_error: "Invalid password" })
    .min(6, "Password minimum 6 characters"),
  role: z.enum(["regular_user", "seller"], { required_error: "Role is required", invalid_type_error: "Invalid role" }),
});

export const loginUserSchema = z.object({
  email: z
    .string({ required_error: "Email is required", invalid_type_error: "Invalid email" })
    .min(1, "Email is required")
    .email(),
  password: z
    .string({ required_error: "Password is required", invalid_type_error: "Invalid password" })
    .min(6, "Password minimum 6 characters"),
});

// used in express.d.ts
export const UserInfoType = z.object({
  id: z.string(),
  email: z.string(),
  role: z.string(),
  role_level: z.number(),
});
export type UserInfo = z.infer<typeof UserInfoType>;
