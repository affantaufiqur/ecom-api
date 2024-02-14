import { z } from "zod";
import { products } from "@/db/schema/schema.js";

export const insertProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  price: z
    .number({ required_error: "Price is required", invalid_type_error: "Invalid price" })
    .min(1, "Price must be greater than 0")
    .nonnegative(),
  quantity: z
    .number({ required_error: "Quantity is required", invalid_type_error: "Invalid quantity" })
    .min(1, "Quantity must be greater than 0")
    .nonnegative(),
  description: z.string().min(1, "Description is required").max(200, "Description must be less than 200 characters"),
});

export type InferSelectProducts = typeof products.$inferSelect;
