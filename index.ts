import express from "express";
import authRoute from "./src/routes/auth.js";
import productRoute from "./src/routes/product.js";

const app = express();
const port = 3000;

app.use(express.json());
app.use("/api/auth", authRoute);
app.use("/api", productRoute);
app.get("/", (_req, res) => {
  res.json({ message: "Hello World!" });
});

app.listen(port, () => console.log(`Listening on port ${port}`));
export default app;
