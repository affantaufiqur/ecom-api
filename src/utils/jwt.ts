import jwt from "jsonwebtoken";
import "dotenv/config";

const secret = process.env.JWT_SECRET!;

export function tokenHandler<T>(payload: T extends object ? T : never) {
  const expiry = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60; // Expiry time in Unix timestamp (seconds)
  const accessToken = jwt.sign({ user: payload }, secret, { expiresIn: "1h" });
  const refreshToken = jwt.sign({ user: payload }, secret, { expiresIn: expiry - Math.floor(Date.now() / 1000) });
  return { accessToken, refreshToken };
}
