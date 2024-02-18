import express from "express";
import authRoute from "./src/routes/auth.js";
import productRoute from "./src/routes/product.js";
import CartRoute from "./src/routes/cart.js";
import OrderRouter from "./src/routes/order.js";
import PaymentRouter from "./src/routes/payment.js";

const app = express();
const port = 3000;

app.use(express.json());
app.use("/api/auth", authRoute);
app.use("/api", productRoute);
app.use("/api", CartRoute);
app.use("/api", OrderRouter);
app.use("/api", PaymentRouter);

app.get("/", (_req, res) => {
  res.json({ message: "Hello World!" });
});

app.listen(port, () => console.log(`Listening on port ${port}`));
export default app;
