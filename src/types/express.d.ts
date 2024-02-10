import { UserInfo } from "../types/insert.types.js";
export {};

declare global {
  namespace Express {
    export interface Request {
      user?: UserInfo;
    }
  }
}
