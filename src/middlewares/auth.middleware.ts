import { Response, Request, NextFunction } from "express";
import "dotenv/config";
import jwt from "jsonwebtoken";
import { UserInfo } from "@/types/insert.types.js";
import { ROLE } from "@/utils/shared.js";

function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const bearer = req.headers.authorization;
    if (!bearer) return res.status(401).json({ message: "Please provide token" });
    const token = bearer.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    return jwt.verify(token, process.env.JWT_SECRET!, (err, decoded) => {
      if (err) return res.status(401).json({ message: "Unauthorized", error: err.message });
      const token = decoded as jwt.JwtPayload;
      req.user = token.user as UserInfo;
      next();
      return;
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

function roleLevelMiddleware(role: keyof typeof ROLE) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const { role_level } = req.user!;
      if (role_level! < ROLE[role].level) return res.status(403).json({ message: "Forbidden" });
      next();
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
}

export { authMiddleware, roleLevelMiddleware };
