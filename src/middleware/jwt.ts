import { NextFunction, Response } from "express";
import { TokenManager } from "../util/jwt";
import { ApiRequest } from "../core/Request";

export function validateToken(
	req: ApiRequest,
	res: Response,
	next: NextFunction
) {
	try {
		const bearerHeader = req.headers.get('authorization')?.split(' ')[1];
		if (bearerHeader) {
			req.tokenPayload = TokenManager.verifyToken(bearerHeader);
			next();
			return;
		}
		throw 'Token required';
	} catch (err) {
		res.
            status(400)
            .send({ 
                message: 'Token Error', 
                err: err, 
                token: req.headers.get('authorization')?.split(' ')[1] 
            });
	}
}