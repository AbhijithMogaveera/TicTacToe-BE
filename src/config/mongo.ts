import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.MONGO_URL ?? '';

export function connectToDatabase(
	onFailure: (err: any) => void,
	onSuccess: () => void
) {
	mongoose
		.connect(url, { connectTimeoutMS: 3000 })
		.then(onSuccess)
		.catch(onFailure);
}

export function connectToDatabaseAsync() {
	return mongoose.connect(url, { connectTimeoutMS: 3000 });
}