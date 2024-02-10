import "dotenv/config";
import { Router } from "express";
import { db } from "../config/db.js";
import { users } from "../db/schema.js";
import argon2 from "argon2";
import { insertUserSchema } from "../types/insert.types.js";
import { handleValidationError } from "../validation/error.js";
import jwt from "jsonwebtoken";

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
    res.status(200).json({ message: "User created", token });
    return;
  } catch (err) {
    res.status(500).json({ error: "Something went wrong" });
    return;
  }
});

app.post("/login", async (req, res) => {
  const parseUserRequest = insertUserSchema.safeParse(req.body);
  if (!parseUserRequest.success) {
    return handleValidationError(({ error, message }) => {
      return res.status(400).json({ error, message });
    }, parseUserRequest.error);
  }
  return;
});

// just an example
app.get("/token", (req, res) => {
  const bearer = req.headers.authorization;
  const authToken = bearer?.split(" ")[1];
  const secret = process.env.JWT_SECRET!;
  const token = jwt.sign(
    {
      email: "golem",
    },
    secret,
    { expiresIn: "1h" },
  );
  const decode = jwt.verify(authToken!, secret);
  const currentTime = new Date();
  const tokenExpires = decode.exp;
  const isExpired = currentTime.getTime() < tokenExpires;
  return res.json({ token, payload: decode, isExpired });
});

export default app;
