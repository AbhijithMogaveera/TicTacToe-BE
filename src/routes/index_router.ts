import express from "express";
import { AuthRouter } from "./auth_router";

export const indexRouter = express.Router();

indexRouter.use("/v1/auth", AuthRouter)