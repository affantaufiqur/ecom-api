import argon2 from "argon2";
import "dotenv/config";
import { eq } from "drizzle-orm";
import { Router } from "express";
import jwt from "jsonwebtoken";
import { db } from "../config/db.js";
import { tokens, users } from "../db/schema.js";
import { insertUserSchema } from "../types/insert.types.js";
import { handleValidationError } from "../validation/error.js";

const app = Router();
type user = Omit<typeof users.$inferInsert, "id">;
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
    const secret = process.env.JWT_SECRET!;
    //TODO: Check if user email already exist
    await db.transaction(async (tx) => {
      const findUser = await tx.query.users.findFirst({
        where: eq(users.email, email),
      });
      if (findUser) {
        return res.status(400).json({ error: "User already exist" });
      }
      await tx.insert(users).values({
        email,
        password: hashPassword,
      });

      // need to make query again to get user after insert
      // drizzle limitation on mysql
      // see https://orm.drizzle.team/docs/insert#insert-returning
      const user = await tx.query.users.findFirst({
        where: eq(users.email, email),
        columns: {
          password: false,
        },
      });

      // user will be type of users or undefined
      // since if insert fail it will immediantly throw
      // we can ignore the undefined
      const accessToken = jwt.sign(
        {
          user,
        },
        secret,
        { expiresIn: "1h" },
      );
      const refreshToken = jwt.sign(
        {
          user,
        },
        secret,
        { expiresIn: "7d" },
      );
      const expiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await tx.insert(tokens).values({
        token: refreshToken,
        user_id: user?.id,
        expires_at: expiry,
      });
      return res.json({ user, acces_token: accessToken, refresh_token: refreshToken });
    });
    return;
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Something went wrong" });
    return;
  }
});

app.post("/login", (req, res) => {
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
  if (!bearer) return res.sendStatus(401);
  const authToken = bearer?.split(" ")[1];
  const secret = process.env.JWT_SECRET!;
  const accessToken = jwt.sign(
    {
      email: "golem",
    },
    secret,
    { expiresIn: "1h" },
  );
  const refreshToken = jwt.sign(
    {
      email: "golem",
    },
    secret,
    { expiresIn: "7d" },
  );
  const decode = jwt.verify(authToken, secret) as jwt.JwtPayload;
  const currentTime = new Date();
  const tokenExpires = decode.exp;
  // .user is based on the jwt sign
  // if user then it's .user
  // if data then it's .data
  const isExpired = currentTime.getTime() < tokenExpires!;
  return res.json({ token: accessToken, payload: decode, isExpired, refreshToken });
});

export default app;
