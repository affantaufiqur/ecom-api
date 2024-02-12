import { db } from "@/config/db.js";
import { getUserFromDb } from "@/data-access/auth.access.js";
import { tokens, users } from "@/db/schema.js";
import { insertUserSchema, loginUserSchema } from "@/types/insert.types.js";
import { tokenHandler } from "@/utils/jwt.js";
import { getRoleLevel } from "@/utils/shared.js";
import { handleValidationError } from "@/validation/error.js";
import argon2 from "argon2";
import "dotenv/config";
import { eq } from "drizzle-orm";
import { Router } from "express";
import jwt from "jsonwebtoken";

const app = Router();

app.post("/register", async (req, res) => {
  try {
    const parseUserRequest = insertUserSchema.safeParse(req.body);
    if (!parseUserRequest.success) {
      return handleValidationError(({ error, message }) => {
        return res.status(400).json({ error, message });
      }, parseUserRequest.error);
    }

    const { email, password, role } = parseUserRequest.data;
    const hashPassword = await argon2.hash(password);
    const findUser = await getUserFromDb(email);
    await db.transaction(async (tx) => {
      if (findUser) {
        return res.status(400).json({ error: "User already exist" });
      }
      await tx.insert(users).values({
        email,
        password: hashPassword,
        role,
        role_level: getRoleLevel(role),
      });

      // need to make query again to get user after insert
      // drizzle limitation on mysql
      // see https://orm.drizzle.team/docs/insert#insert-returning
      const user = await tx.query.users.findFirst({
        where: eq(users.email, email),
        columns: {
          id: true,
          email: true,
          role: true,
          role_level: true,
        },
      });

      // user will be type of users or undefined
      // since if insert fail it will immidiately throw
      // we can ignore the undefined
      const { accessToken, refreshToken } = tokenHandler(user!);
      const expiry = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60; // Expiry time in Unix timestamp (seconds)
      await tx.insert(tokens).values({
        token: refreshToken,
        user_id: user?.id,
        expires_at: new Date(expiry * 1000), // Convert Unix timestamp to JavaScript Date object
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

app.post("/login", async (req, res) => {
  try {
    const parseUserRequest = loginUserSchema.safeParse(req.body);
    if (!parseUserRequest.success) {
      return handleValidationError(({ error, message }) => {
        return res.status(400).json({ error, message });
      }, parseUserRequest.error);
    }
    const { email, password } = parseUserRequest.data;
    const getUser = await getUserFromDb(email);
    if (!getUser) {
      return res.status(400).json({ error: "User not found" });
    }
    await db.transaction(async (tx) => {
      const comparePassword = await argon2.verify(getUser.password, password);
      if (!comparePassword) {
        return res.status(400).json({ error: "Invalid password" });
      }
      const finalUser = {
        id: getUser.id,
        email: getUser.email,
      };
      // generate new access token
      const { accessToken } = tokenHandler(finalUser);

      // check if refresh_token already exist
      // if not generate one
      const getRefreshToken = await tx.query.tokens.findFirst({
        where: eq(tokens.user_id, getUser.id),
        columns: {
          token: true,
        },
      });
      if (!getRefreshToken) {
        const expiry = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60; // Expiry time in Unix timestamp (seconds)
        const { refreshToken } = tokenHandler(finalUser);
        await tx.insert(tokens).values({
          token: refreshToken,
          user_id: getUser.id,
          expires_at: new Date(expiry * 1000), // Convert Unix timestamp to JavaScript Date object
        });
        const verify = jwt.verify(refreshToken, process.env.JWT_SECRET!) as jwt.JwtPayload;
        if (verify.exp! < Math.floor(Date.now() / 1000)) {
          const { refreshToken } = tokenHandler(finalUser);
          return res.status(200).json({ user: finalUser, access_token: accessToken, refresh_token: refreshToken });
        }
        return res.status(200).json({ user: finalUser, access_token: accessToken, refresh_token: refreshToken });
      }

      return res.status(200).json({ user: finalUser, access_token: accessToken, refresh_token: getRefreshToken.token });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Something went wrong" });
    return;
  }
});

app.get("/current-user", (req, res) => {
  // in this endpoint the bearer token that is passed are the access_token
  // if the access_token is expired then we will get 401
  try {
    const bearer = req.headers.authorization;
    if (!bearer) {
      return res.status(401).json({ error: "Invalid token" });
    }
    const token = bearer.split(" ")[1];
    const user = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload;
    const leeway = Math.floor(Date.now() / 1000) - 60;
    if (Date.now() + leeway < user.exp! * 1000) {
      return res.status(401).json({ error: "Token expired, please login again" });
    }
    return res.status(200).json(user);
  } catch (err) {
    if ((err as { name: string; message: string }).message === "invalid signature") {
      return res.status(401).json({ error: "Invalid token" });
    }
    res.status(500).json({ error: err });
    return;
  }
});

export default app;
