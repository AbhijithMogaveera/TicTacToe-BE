import { NextFunction, Request, Response } from "express";
import { ForumPostValidation } from "../validators/forum";
import { ForumService } from "../services/forum";
import { AuthService } from "../services/auth";
import { ApiRequest } from "../core/Request";

export let ForumRestControler = {

  async addPostToForum(req: ApiRequest, res: Response) {
    try {
      const { value, error } = ForumPostValidation.validate(req.body);
      if (error || !value) {
        res.status(200).json({
          message: error?.details.map((it) => it.message),
        });
        return
      }
      let post_id = await ForumService.addPostToForum({
        httpReq: value,
        postedBy: req.tokenPayload?.user_name!!,
      });
      res.status(200).json({
        post_id: post_id,
      });
    } catch (e: any) {
      res.status(400).json({
        message: e?.message,
      });
    }
  },

  async deletePostFromFourum(req: Request, res: Response) {
    try {
      let postId = req.params.post_id;
      if (!postId) {
        res.status(400).json({
          message: "Provide post id to perform delete operation",
        });
        return;
      }
      await ForumService.removePostFromFourum({ id: postId });
      res.status(200).send()
    } catch (e: any) {
      res.status(400).json({
        message: e?.message,
      });
    }
  },

  async getPostsFromFourum(req: Request, res: Response) {
    let postId = req.query["post_id"] as string;
    try {
      let posts = await ForumService.getPosts({
        limit: 20,
        after_post_id: postId,
      });
      res.status(200).json({
        posts: posts,
      });
    } catch (e: any) {
      res.status(400).json({
        message: e?.message,
      });
    }
  },
};
