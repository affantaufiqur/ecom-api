import { db } from "@/config/db.js";
import { users } from "@/db/schema.js";
import { eq } from "drizzle-orm";

export async function getUserFromDb(email: string) {
  try {
    return await db.query.users.findFirst({ where: eq(users.email, email), columns: { password: false } });
  } catch (err) {
    return undefined;
  }
}
