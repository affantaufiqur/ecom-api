import { db } from "@/config/db.js";
import { users } from "@/db/schema/schema.js";
import { ROLE } from "@/utils/shared.js";
import argon2 from "argon2";
import { faker } from "@faker-js/faker";

async function seed() {
  try {
    const COUNT = 50;
    for (let i = 0; i < COUNT; i++) {
      const role = faker.helpers.arrayElement(Object.keys(ROLE));
      // @ts-expect-error because of as const
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const role_level: number = ROLE[role].level;
      const user = {
        email: faker.internet.email(),
        password: await argon2.hash("password"),
        role,
        role_level,
      };
      await db.insert(users).values(user);
    }
    return;
  } catch (err) {
    console.log(err);
    return;
  }
}

await seed();
