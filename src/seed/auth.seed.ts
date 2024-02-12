import { db } from "@/config/db.js";
import { users } from "@/db/schema/user.js";
import { ROLE } from "@/utils/shared.js";
import argon2 from "argon2";

async function seed() {
  const email = ["test@me.com", "test2@me.com", "test3@me.com"];
  try {
    for (const mail of email) {
      const hashPassword = await argon2.hash("123456");
      await db.insert(users).values({
        email: mail,
        password: hashPassword,
        role: ROLE.regular_user.name,
        role_level: ROLE.regular_user.level,
      });
    }
    return;
  } catch (err) {
    console.log(err);
    return;
  }
}

await seed();
