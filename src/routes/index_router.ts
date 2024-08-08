import express from "express";
import { AuthRouter } from "./auth";
import { ProfileRouter } from "./profile";

export const indexRouter = express.Router();

indexRouter.use("/v1/auth", AuthRouter)
indexRouter.use("/v1/profile", ProfileRouter)
