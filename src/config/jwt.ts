
import { SignOptions } from 'jsonwebtoken';

export let JwtSignOptions: SignOptions = {
	expiresIn: '60d',
};

export let JWTSecretKey = "SKeyOfJwt" //process.env.JWTSecretKey;