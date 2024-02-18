import { db } from "@/config/db.js";
import { eq } from "drizzle-orm";
import { carts } from "@/db/schema/schema.js";

export async function getCartById(userId: string) {
  return await db.query.carts.findFirst({
    where: eq(carts.user_id, userId),
  });
}
