import { Router } from "express";
import { db } from "../config/db.js";
import { users } from "../db/schema.js";
import argon2 from "argon2";
import { insertUserSchema } from "../types/insert.types.js";
import { handleValidationError } from "../validation/error.js";

const app = Router();

// TODO: Generate token and return it
app.post("/register", async (req, res) => {
  try {
    const parseUserRequest = insertUserSchema.safeParse(req.body);
    if (!parseUserRequest.success) {
      return handleValidationError(({ error, message }) => {
        return res.status(400).json({ error, message });
      }, parseUserRequest.error);
    }

    const { email, password } = parseUserRequest.data;
    const hashPassword = await argon2.hash(password);

    await db.insert(users).values({
      email,
      password: hashPassword,
    });
    res.status(200).json({ message: "User created" });
    return;
  } catch (err) {
    res.status(500).json({ error: "Something went wrong" });
    return;
  }
});

export default app;
