import { JwtPayload } from "jsonwebtoken";
import { AppJwtPayload } from "../../util/jwt";

export interface UserMeta {
  bio: string;
  profile_image?: string;
  user_name: string;
}
