import express from "express";
import { AuthRouter } from "./auth";
import { validateToken } from "../middleware/jwt";
import { ProfileRouter } from "./profile";

export const indexRouter = express.Router();

indexRouter.use("/v1/auth", AuthRouter)
indexRouter.use("/v1/profile", ProfileRouter)
