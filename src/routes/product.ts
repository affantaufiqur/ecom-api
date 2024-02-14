import { db } from "@/config/db.js";
import { products } from "@/db/schema/schema.js";
import { authMiddleware, roleLevelMiddleware } from "@/middlewares/auth.middleware.js";
import { ROLE } from "@/utils/shared.js";
import { handleValidationError } from "@/validation/error.js";
import { insertProductSchema } from "@/validation/product.validation.js";
import { eq, sql } from "drizzle-orm";
import { Router } from "express";

const app = Router();

app.get("/products", async (req, res) => {
  try {
    const query = req.query.q?.toString();
    if (!query) {
      const product = await db.select().from(products).limit(20);
      if (!product.length) return res.status(404).json({ message: "There are no products in our database :( )" });
      return res.status(200).json(product);
    }

    //TODO: Check this query
    // https://orm.drizzle.team/docs/sql#sql-in-where
    const searchProducts = await db
      .select()
      .from(products)
      .where(sql`MATCH(${products.name}) AGAINST(${query} IN BOOLEAN MODE)`);
    if (!searchProducts.length)
      return res.status(404).json({ message: "Product that you are looking for does not exist" });
    return res.status(200).json(searchProducts);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/products", authMiddleware, roleLevelMiddleware(ROLE.seller.name), async (req, res) => {
  try {
    const parseInput = insertProductSchema.safeParse(req.body);
    if (!parseInput.success) {
      return handleValidationError(({ error, message }) => res.status(400).json({ error, message }), parseInput.error);
    }
    await db.insert(products).values(parseInput.data);
    return res.status(200).json({ message: "Product added successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.delete("/products/:id", authMiddleware, roleLevelMiddleware(ROLE.seller.name), async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(products).where(eq(products.id, id));
    return res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.put("/products/:id", authMiddleware, roleLevelMiddleware(ROLE.seller.name), async (req, res) => {
  try {
    const { id } = req.params;
    const parseInput = insertProductSchema.safeParse(req.body);
    if (!parseInput.success) {
      return handleValidationError(({ error, message }) => res.status(400).json({ error, message }), parseInput.error);
    }
    await db.update(products).set(parseInput.data).where(eq(products.id, id));
    return res.status(200).json({ message: "Product updated successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default app;
