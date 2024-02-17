import { authMiddleware } from "@/middlewares/auth.middleware.js";
import { Router } from "express";
import { db } from "@/config/db.js";
import { cart_items, carts, products } from "@/db/schema/schema.js";
import { and, eq } from "drizzle-orm";
import { insertCartSchema } from "@/validation/cart.validation.js";
import { handleValidationError } from "@/validation/error.js";
import { getCartById } from "@/data-access/cart.access.js";
import { formatPrice } from "@/utils/shared.js";

const app = Router();

app.get("/cart", authMiddleware, async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const cart = await db.select().from(carts).where(eq(carts.user_id, req.user.id));
    if (cart.length === 0) return res.status(404).json({ message: "Please add product to cart, to create your cart" });
    const getCartItems = await db
      .select({
        id: cart_items.id,
        product_id: cart_items.product_id,
        product_name: products.name,
        price: products.price,
        quantity: cart_items.quantity,
      })
      .from(cart_items)
      .where(eq(cart_items.cart_id, cart[0].id))
      .innerJoin(products, eq(cart_items.product_id, products.id));
    const calculateTotalPrice = getCartItems.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
    const calculateQuantity = getCartItems.reduce((acc, curr) => acc + curr.quantity, 0);
    return res.status(200).json({
      data: getCartItems,
      total_price: formatPrice(calculateTotalPrice),
      total_quantity: calculateQuantity,
      message: "Cart fetched successfully",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// allow reguler_user and seller to add products into cart and buy
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

    let checkCart = await getCartById(req.user.id);

    async function insertIntoCartItem(data: typeof cart_items.$inferInsert) {
      await db.insert(cart_items).values(data);
    }

    if (!checkCart) {
      await db.insert(carts).values({
        user_id: req.user.id,
      });
      checkCart = await getCartById(req.user.id);
      await insertIntoCartItem({
        cart_id: checkCart?.id,
        product_id,
        quantity,
      });
      return res.status(200).json({ message: "New product added to cart" });
    } else {
      const checkItemsInCart = await db.query.cart_items.findFirst({
        where: and(eq(cart_items.cart_id, checkCart.id), eq(cart_items.product_id, product_id)),
      });
      if (!checkItemsInCart) {
        await insertIntoCartItem({
          cart_id: checkCart?.id,
          product_id,
          quantity,
        });
        return res.status(200).json({ message: "New product added to cart" });
      }
      await db.update(cart_items).set({ quantity }).where(eq(cart_items.id, checkItemsInCart.id));
      return res.status(200).json({ message: "Product quantity updated" });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.patch("/cart/:id", authMiddleware, async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const { id } = req.params;
    const { quantity } = req.body as { quantity: number };
    if (!quantity || quantity < 1 || !Number.isInteger(quantity))
      return res.status(400).json({ message: "Invalid quantity" });
    const cart = await db.query.carts.findFirst({
      where: eq(carts.user_id, req.user.id),
    });
    if (!cart) return res.status(404).json({ message: "Cart not found" });
    const isProductInCartItems = await db.query.cart_items.findFirst({
      where: and(eq(cart_items.cart_id, cart.id), eq(cart_items.product_id, id)),
    });
    if (!isProductInCartItems) return res.status(404).json({ message: "Product not found in cart" });
    await db
      .update(cart_items)
      .set({ quantity })
      .where(
        and(
          eq(cart_items.cart_id, isProductInCartItems.cart_id!),
          eq(cart_items.product_id, isProductInCartItems.product_id!),
        ),
      );
    return res.status(200).json({ message: "Product quantity updated" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// this will delete the product inside cart_items
// which cart will based on the current user logged in
// the id will be the product_id
app.delete("/cart/:id", authMiddleware, async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const { id } = req.params;
    const cart = await db.query.carts.findFirst({
      where: eq(carts.user_id, req.user.id),
    });
    if (!cart) return res.status(404).json({ message: "Cart not found" });
    const isProductInCartItems = await db.query.cart_items.findFirst({
      where: and(eq(cart_items.cart_id, cart.id), eq(cart_items.product_id, id)),
    });
    if (!isProductInCartItems) return res.status(404).json({ message: "Product not found in cart" });
    await db.delete(cart_items).where(and(eq(cart_items.cart_id, cart.id), eq(cart_items.product_id, id)));
    return res.status(200).json({ message: "Product in cart deleted successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default app;
