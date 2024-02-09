import express from "express";
import auth from "./src/routes/auth/create.js";

const app = express();
const port = 3000;
app.use(express.json());
app.use(auth);

app.listen(port, () => console.log(`Listening on port ${port}`));
export default app;
