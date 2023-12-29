import express from "express"

import { loginRoute, registrationRoute } from "../controllers/auth"

export const AuthRouter = express.Router()
AuthRouter.post('/login', loginRoute)
AuthRouter.post('/registration', registrationRoute)