import { authMiddleware } from "@/middlewares/auth.middleware.js";
import { Router } from "express";
import { db } from "@/config/db.js";
import { cart_items, carts, products } from "@/db/schema/schema.js";
import { eq, sql } from "drizzle-orm";
import { insertCartSchema } from "@/validation/cart.validation.js";
import { handleValidationError } from "@/validation/error.js";

const app = Router();

app.get("/cart", authMiddleware, async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    console.log(req.user);
    const cart = await db.query.carts.findMany({
      where: eq(carts.user_id, req.user.id!),
    });
    return res.status(200).json({ data: cart, message: "Cart fetched successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// allow reguler_user and seller to buy product
// but seller can't buy their own product
app.post("/cart", authMiddleware, async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const parseInput = insertCartSchema.safeParse(req.body);
    if (!parseInput.success) {
      return handleValidationError(({ error, message }) => res.status(400).json({ error, message }), parseInput.error);
    }
    const { product_id, quantity } = parseInput.data;
    const checkProduct = await db.query.products.findFirst({
      where: eq(products.id, product_id),
    });
    if (!checkProduct) return res.status(404).json({ message: "Product not found" });
    if (checkProduct.seller_id === req.user.id)
      return res.status(400).json({ message: "You cannot add your own product" });
    if (checkProduct.quantity < quantity) return res.status(400).json({ message: "Insufficient quantity" });

    const checkCart = await db.query.carts.findFirst({
      where: eq(carts.user_id, req.user.id!),
    });

    if (!checkCart) {
      await db.insert(carts).values({ user_id: req.user.id! });
    } else {
      await db
        .update(cart_items)
        .set({ quantity })
        .where(sql`${cart_items.cart_id} = ${checkCart.id} AND ${cart_items.product_id} = ${product_id}`);
    }

    await db.insert(cart_items).values({ cart_id: checkCart?.id, product_id, quantity });

    return res.status(200).json({ message: "Cart added successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default app;
