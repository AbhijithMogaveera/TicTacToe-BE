import express from "express";
import { AuthRouter } from "./auth";
import { validateToken } from "../middleware/jwt";

export const indexRouter = express.Router();

indexRouter.use("/v1/auth", AuthRouter)
