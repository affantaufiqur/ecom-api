import { db } from "@/config/db.js";
import { Router } from "express";
import { authMiddleware } from "@/middlewares/auth.middleware.js";
import { cart_items, carts, order_items, orders, products } from "@/db/schema/schema.js";
import { and, eq } from "drizzle-orm";
import { formatPrice } from "@/utils/shared.js";

const app = Router();

app.get("/order", authMiddleware, async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const getOrder = await db.query.orders.findFirst({
      where: eq(orders.user_id, req.user.id),
    });
    if (!getOrder) return res.status(404).json({ message: "Order not found" });
    const orderItems = await db.query.order_items.findMany({
      where: and(eq(order_items.cart_id, getOrder.cart_id!), eq(order_items.order_id, getOrder.id)),
    });
    if (!orderItems.length) return res.status(404).json({ message: "Order item not found" });
    const mappedPrice = orderItems.map((item) => {
      return { ...item, price: formatPrice(item.price) };
    });
    res.json({ data: mappedPrice });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/order/:id", authMiddleware, async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const { id } = req.params;
    const orderItems = await db.query.order_items.findFirst({
      where: eq(order_items.id, Number(id)),
    });
    if (!orderItems) return res.status(404).json({ message: "Order item not found" });
    const checkCart = await db.query.carts.findFirst({
      where: eq(carts.id, req.user.id),
    });
    if (!checkCart) return res.status(404).json({ message: "Order not found, because no order were made" });
    const ifUserValid = orderItems.cart_id === checkCart.id;
    if (!ifUserValid) return res.status(401).json({ message: "Unauthorized" });
    const formattedPrice = formatPrice(orderItems.price);
    res.json({ data: { ...orderItems, price: formattedPrice } });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/order", authMiddleware, async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const { cart_id } = req.body as { cart_id: string | null };
    if (!cart_id) return res.status(400).json({ message: "Invalid cart id" });
    const userId = req.user.id;

    const isCartOwnByUser = await db.query.carts.findFirst({
      where: and(eq(carts.user_id, userId), eq(carts.id, cart_id)),
    });

    if (!isCartOwnByUser)
      return res
        .status(404)
        .json({ message: "Why are you trying to make order for this cart, this belong to someone else" });

    const getCartItems = await db
      .select({
        price: products.price,
        quantity: cart_items.quantity,
      })
      .from(cart_items)
      .where(eq(cart_items.cart_id, cart_id))
      .innerJoin(products, eq(cart_items.product_id, products.id));

    if (!getCartItems.length) return res.status(404).json({ message: "Cant make orders, because cart is empty" });

    const calculateTotalPrice = getCartItems.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
    const calculateQuantity = getCartItems.reduce((acc, curr) => acc + curr.quantity, 0);

    async function getOrderById() {
      return await db.query.orders.findFirst({
        where: and(eq(orders.user_id, userId), eq(orders.cart_id, cart_id!)),
      });
    }

    const checkOrderByCartId = await getOrderById();
    if (!checkOrderByCartId) {
      await db.insert(orders).values({
        cart_id,
        user_id: req.user.id,
      });
      const getOrderId = await getOrderById();
      await db.insert(order_items).values({
        order_id: getOrderId?.id,
        cart_id: getOrderId?.cart_id,
        quantity: calculateQuantity,
        price: calculateTotalPrice,
      });
      return res.json({ message: "Orders placed" });
    }

    await db.insert(order_items).values({
      cart_id,
      order_id: checkOrderByCartId.id,
      quantity: calculateQuantity,
      price: calculateTotalPrice,
    });

    await db.delete(cart_items).where(eq(cart_items.cart_id, cart_id));

    return res.status(200).json({ message: "Order placed successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// app.get("/orders", authMiddleware, async (req, res) => {
//   const bearer = req.headers.authorization;
//   const token = bearer.split(" ")[1];
//   const data = await ky.get("http://localhost:3000/api/cart", {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });
//   const final = await data.json();
//   return res.status(200).json(final);
// });

export default app;
