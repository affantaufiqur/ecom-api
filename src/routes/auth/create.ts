import { Router } from "express";
import { db } from "../../config/db.js";
import { users } from "../../db/schema.js";
import argon2 from "argon2";
import { insertUser } from "../../types/insert.types.js";
import { handleValidationError } from "../../validation/error.js";

const app = Router();

app.post("/register", async (req, res) => {
  try {
    const user = insertUser.safeParse(req.body);
    if (!user.success) {
      const errMessage = handleValidationError(user.error);
      res.status(400).json({ error: "validation error", message: errMessage });
      return;
    }
    const hash = await argon2.hash(user.data.password);
    await db.insert(users).values({
      email: user.data.password,
      password: hash,
    });
    res.status(200).json({ message: "User created" });
    return;
  } catch (err) {
    res.status(500).json({ error: "Something went wrong" });
    return;
  }
});

export default app;
