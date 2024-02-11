import express from "express";
import auth from "./src/routes/auth.js";

const app = express();
const port = 3000;
app.use(express.json());

app.use("/api/auth", auth);
app.get("/", (_req, res) => {
  res.json({ message: "Hello World!" });
});

app.listen(port, () => console.log(`Listening on port ${port}`));
export default app;
