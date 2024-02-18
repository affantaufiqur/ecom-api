import { z } from "zod";

export const insertCartSchema = z.object({
  product_id: z
    .string({ required_error: "Product ID is required", invalid_type_error: "Product ID must be a string" })
    .ulid(),
  quantity: z
    .number({ required_error: "Quantity is required", invalid_type_error: "Quantity must be a number" })
    .min(1),
});
