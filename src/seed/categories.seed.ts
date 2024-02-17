import { db } from "@/config/db.js";
import { category } from "@/db/schema/schema.js";
import { PRODUCT_CATEGORIES } from "@/utils/shared.js";

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(async () => {
  const value = PRODUCT_CATEGORIES.map((category) => ({ name: category }));
  await db.insert(category).values(value);
  return;
})();
