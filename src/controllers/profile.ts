import { NextFunction, Request, Response } from "express";
import { ApiRequest } from "../core/Request";
import { findUserByUsername, updateProfileDeatils } from "../services/profile";
import { ClientIssue, handleException } from "../config/ClientIssue";

export const ProfileContorller = {
  async   updateProfile(req: ApiRequest, res: Response, next: NextFunction) {
    try {
      let userName = req.tokenPayload?.user_name;
      if (userName) {
        await updateProfileDeatils({
          profile_image_path: req.file?.path,
          user_name: userName,
          bio: req.body.bio,
        });
        next()
      }
    } catch (e) {
        handleException(res, e)
    }
  },

  async getProfileDetails(req: ApiRequest, res: Response, next: NextFunction) {
    try {
      let userName = req.params.user_name ?? req.tokenPayload?.user_name;
      if (userName) {
        let user = await findUserByUsername(userName);
        if (user) {
          res.status(200).send(user);
        } else {
          let issue:ClientIssue = {
            key:"ResourceNotFound",
            message:`User with user_name ${userName} not found`
          };
          res.status(400).send(issue);
        }
      } else throw "Un authorised user";
    } catch (error) {
        handleException(res, error)
    }
  },
};
