import express from "express";
import { AuthRouter } from "./auth";
import { FourmRouter } from "./forum";
import { validateToken } from "../middleware/jwt";

export const indexRouter = express.Router();

indexRouter.use("/v1/auth", AuthRouter)
indexRouter.use("/v1/forum", validateToken,FourmRouter)