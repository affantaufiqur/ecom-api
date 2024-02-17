import { db } from "@/config/db.js";
import { categories, products } from "@/db/schema/schema.js";
import { authMiddleware, roleLevelMiddleware } from "@/middlewares/auth.middleware.js";
import { ROLE, formatStringToSQLPercent } from "@/utils/shared.js";
import { handleValidationError } from "@/validation/error.js";
import { insertProductSchema, updateProductSchema } from "@/validation/product.validation.js";
import { eq, count, sql } from "drizzle-orm";
import { Router } from "express";

const app = Router();

app.get("/products", async (req, res) => {
  try {
    const query = req.query;
    if (isNaN(Number(query?.page)) && query.page) {
      return res.status(400).json({ message: "Invalid page number" });
    }
    const pageCount = Number(query.page) < 0 ? Number(query.page) * -1 : Number(query.page) || 1;
    const limit = 10;
    const offset = (pageCount - 1) * limit;

    let productData;
    let countProductData;

    if (Object.keys(query).length > 0) {
      const { q, category, description }: { q?: string; category?: string; description?: string } = query;
      const searchQuery = q ? formatStringToSQLPercent(q.toString()) : "";
      const categoryQuery = category ? formatStringToSQLPercent(category.toString()) : "";
      const descriptionQuery = description ? formatStringToSQLPercent(description.toString()) : "";

      productData = await db
        .select({
          id: products.id,
          name: products.name,
          description: products.description,
          price: products.price,
          quantity: products.quantity,
          category: categories.name,
        })
        .from(products)
        .leftJoin(categories, eq(products.category_id, categories.id))
        .where(
          sql`${products.name} like ${searchQuery} or ${categories.name} LIKE ${categoryQuery} or ${products.description} LIKE ${descriptionQuery}`,
        )
        .limit(limit)
        .offset(pageCount ? (pageCount - 1) * limit : 0);

      countProductData = await db
        .select({ value: count() })
        .from(products)
        .leftJoin(categories, eq(products.category_id, categories.id))
        .where(
          sql`${products.name} LIKE ${searchQuery} or ${categories.name} LIKE ${categoryQuery} or ${products.description} LIKE ${descriptionQuery}`,
        );
    } else {
      productData = await db.select().from(products).limit(limit).offset(offset);
      countProductData = await db.select({ value: count() }).from(products);
    }

    if (productData.length < 1) return res.status(404).json({ message: "Product not found" });

    const totalCount = countProductData[0].value;
    const totalPage = Math.ceil(totalCount / limit);
    const nextPage = pageCount < totalPage ? pageCount + 1 : null;

    return res.json({
      data: productData,
      meta: {
        total_item: totalCount,
        current_page: pageCount,
        next_page: nextPage,
        total_page: totalPage,
      },
    });
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
    const checkIfCategoryExist = await db.query.categories.findFirst({
      where: eq(categories.id, parseInput.data.category_id),
    });
    if (!checkIfCategoryExist) return res.status(404).json({ message: "Category not found" });
    const finalData = { ...parseInput.data, seller_id: req.user?.id };
    await db.insert(products).values(finalData);
    return res.status(200).json({ message: "Product added successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/product/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const product = await db.query.products.findFirst({
      where: eq(products.id, id),
    });
    if (!product) return res.status(404).json({ message: "Product not found" });
    return res.status(200).json(product);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.delete("/products/:id", authMiddleware, roleLevelMiddleware(ROLE.seller.name), async (req, res) => {
  try {
    const { id } = req.params;
    const product = await db.query.products.findFirst({
      where: eq(products.id, id),
    });
    if (!product) return res.status(404).json({ message: "Product not found" });
    const isProductBySeller = product.seller_id === req.user?.id;
    if (!isProductBySeller) return res.status(403).json({ message: "Forbidden" });
    await db.update(products).set({ quantity: 0 }).where(eq(products.id, id));
    return res.status(200).json({ message: "Product quantity set to 0" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.put("/products/:id", authMiddleware, roleLevelMiddleware(ROLE.seller.name), async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const { id } = req.params;
    const product = await db.query.products.findFirst({
      where: eq(products.id, id),
    });
    if (!product) return res.status(404).json({ message: "Product not found" });
    const isProductBySeller = product.seller_id === req.user.id;
    if (!isProductBySeller) return res.status(403).json({ message: "Forbidden" });
    const parseInput = updateProductSchema.safeParse(req.body);
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
