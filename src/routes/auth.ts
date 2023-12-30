import express from "express"

import { AuthRestContoller } from "../controllers/auth"

export const AuthRouter = express.Router()
AuthRouter.post('/login', AuthRestContoller.loginRoute)
AuthRouter.post('/registration', AuthRestContoller.registrationRoute)