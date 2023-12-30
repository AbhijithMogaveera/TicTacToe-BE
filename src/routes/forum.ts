import express from "express"
import { ForumRestControler } from "../controllers/forum"

export const FourmRouter = express.Router()
FourmRouter.post("/post", ForumRestControler.addPostToForum)
FourmRouter.get("/post", ForumRestControler.getPostsFromFourum)
FourmRouter.delete("/post/:post_id", ForumRestControler.deletePostFromFourum)