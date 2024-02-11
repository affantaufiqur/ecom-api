import { db } from "@/config/db.js";
import { users } from "@/db/schema.js";
import argon2 from "argon2";

async function seed() {
  const email = ["test@me.com", "test2@me.com", "test3@me.com"];
  try {
    for (const mail of email) {
      const hashPassword = await argon2.hash("123456");
      await db.insert(users).values({
        email: mail,
        password: hashPassword,
      });
    }
    return;
  } catch (err) {
    console.log(err);
    return;
  }
}

await seed();
