import jwt from "jsonwebtoken";
import { JWTSecretKey, JwtSignOptions } from "../config/jwt";

export interface AppJwtPayload {
  user_name: string;
}

export let TokenManager = {
  verifyToken(token: string): AppJwtPayload {
    let result = jwt.verify(token, JWTSecretKey);
    return result as AppJwtPayload;
  },

  signUser(payload: AppJwtPayload) {
    return jwt.sign(payload, JWTSecretKey, JwtSignOptions);
  },
};
