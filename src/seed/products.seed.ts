import { db } from "@/config/db.js";
import { faker } from "@faker-js/faker";
import { users, categories, products } from "@/db/schema/schema.js";
import { eq } from "drizzle-orm";

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(async () => {
  const LIMIT = 200;
  const category = await db.select().from(categories);
  const seller = await db.select({ id: users.id }).from(users).where(eq(users.role, "seller"));
  for (let i = 0; i < LIMIT; i++) {
    const name = faker.commerce.productName();
    const description = faker.commerce.productDescription();
    const price = Number(faker.commerce.price({ min: 1, max: 999999, dec: 0 }));
    const quantity = Math.floor(Math.random() * 9999) + 1;
    const { id } = category[Math.floor(Math.random() * category.length)];
    const { id: seller_id } = seller[Math.floor(Math.random() * seller.length)];
    await db.insert(products).values({
      name,
      description,
      price,
      quantity,
      category_id: id,
      seller_id,
    });
  }
  return;
})();
