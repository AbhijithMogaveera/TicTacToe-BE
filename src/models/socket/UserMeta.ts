import { JwtPayload } from "jsonwebtoken";

export interface UserMeta {
  bio: string;
  profile_image?: string;
  user_name: string;
}
