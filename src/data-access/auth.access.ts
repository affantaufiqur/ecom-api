import { db } from "@/config/db.js";
import { users } from "@/db/schema/user.js";
import { eq } from "drizzle-orm";

export async function getUserFromDb(email: string) {
  try {
    return await db.query.users.findFirst({
      where: eq(users.email, email),
      columns: {
        id: true,
        email: true,
        role: true,
        role_level: true,
        password: true,
      },
    });
  } catch (err) {
    return undefined;
  }
}
