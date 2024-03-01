import { NextFunction, Response } from "express";
import { TokenManager } from "../util/jwt";
import { ApiRequest } from "../core/Request";
import { ClientIssue } from "../config/ClientIssue";

export function validateToken(
	req: ApiRequest,
	res: Response,
	next: NextFunction
) {
	try {
		const bearerHeader = req.headers['authorization']?.split(' ')[1];
		if (bearerHeader) {
			req.tokenPayload = TokenManager.verifyToken(bearerHeader);
			next();
			return;
		}
		throw 'Token required';
	} catch (err) {
		let issue:ClientIssue = {
			key : "ToeknNotFound",
			message : "Please provide the aut token in header Authorization"
		} 
		res.
            status(401)
            .send(issue);
	}
}