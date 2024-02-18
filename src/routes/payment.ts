import { Router } from "express";
import { db } from "@/config/db.js";
import { authMiddleware } from "@/middlewares/auth.middleware.js";
import { z } from "zod";
import { handleValidationError } from "@/validation/error.js";
import { and, eq } from "drizzle-orm";
import { carts, order_items } from "@/db/schema/schema.js";

const app = Router();

const paymentSchema = z.object({
  invoice: z.string().min(1, "Invoice is required"),
  card_info: z.object({
    cardNumber: z.string().min(1, "Card number is required"),
    cvv: z.number().transform((val, ctx) => {
      if (val.toString().length !== 3) {
        return ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid CVV",
        });
      }
      return val;
    }),
    expiryMonth: z.string({ required_error: "Expiry month is required", invalid_type_error: "Invalid expiry month" }),
    expiryYear: z.string({ required_error: "Expiry year is required", invalid_type_error: "Invalid expiry year" }),
  }),
});

type paymentResponse = {
  message: string;
  data: {
    transactionId: string;
    amount: number;
    date: Date;
  };
};

app.post("/pay", authMiddleware, async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const parseInput = paymentSchema.safeParse(req.body);

    if (!parseInput.success) {
      return handleValidationError(({ error, message }) => res.status(400).json({ error, message }), parseInput.error);
    }

    // check if invoice is indeed owned by user
    const { invoice } = parseInput.data;

    const getInvoice = await db.query.order_items.findFirst({
      where: eq(order_items.invoice, invoice),
    });

    if (!getInvoice) return res.status(404).json({ message: "Invoice not found" });

    const checkWhoseCart = await db.query.carts.findFirst({
      where: and(eq(carts.id, getInvoice.cart_id!), eq(carts.user_id, req.user?.id)),
    });

    if (!checkWhoseCart) return res.status(404).json({ message: "Not your order bro" });
    if (getInvoice.is_paid) return res.status(400).json({ message: "Invoice already paid" });

    const amount = getInvoice.price;

    const post = await fetch("http://localhost:3333/pay", {
      method: "POST",
      body: JSON.stringify({ ...parseInput.data.card_info, amount }),
      headers: {
        "content-type": "application/json",
      },
    });

    const data = (await post.json()) as paymentResponse;

    if (data.message === "Payment failed" || post.status !== 200) {
      return res.status(400).json({ message: data.message });
    }

    await db.update(order_items).set({ is_paid: true }).where(eq(order_items.invoice, invoice));

    return res.json(data);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default app;
