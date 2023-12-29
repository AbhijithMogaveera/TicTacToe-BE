import { AppJwtPayload } from "../util/jwt";

export interface ApiRequest extends Request {
	tokenPayload?: AppJwtPayload;
}