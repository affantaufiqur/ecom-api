import { db } from "@/config/db.js";
import { Router } from "express";

const app = Router();

app.get("/products", async (_req, res) => {
  try {
    const product = await db.query.products.findMany();
    if (!product) return res.status(404).json({ message: "There are no products in our database :( )" });
    return res.status(200).json(product);
  } catch (err) {
    console.log(err);
  }
});

export default app;
