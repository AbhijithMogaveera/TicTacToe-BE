import { Request, Response } from "express";
import { AuthService } from "../services/auth";
import { AuthIssueKeys, handleException } from "../config/ClientIssue";
import { ClientError } from "../error/error";

export const AuthRestContoller = {
  async loginRoute(req: Request, res: Response) {
    try {
      if (!req.body.user_name) {
        throw new ClientError(
          "key user_name is required",
          AuthIssueKeys.UserNameIsRequired
        )
      }
      if (!req.body.password) {
        throw new ClientError(
          "key password is required",
          AuthIssueKeys.PasswordIsRequired
        )
      }
      const user_name = req.body.user_name;
      const password = req.body.password;
      const token = await AuthService.loginUser(user_name, password);
      res.status(200).send(token);
    } catch (e: any) {
      console.log(e)
      handleException(res,e)
    }
  },

  async registrationRoute(req: Request, res: Response) {
    try {
      if(!req.body.user_name){
        throw new ClientError("user_name is not allowed to be empty", AuthIssueKeys.InvalidUserID)
      }
      if(!req.body.password){
        throw new ClientError("password is not allowed to be empty", AuthIssueKeys.InvalidPassword)
      }
      let token = await AuthService.registerUser(req.body);
      res.status(200).send(token);
    } catch (e: any) {
      handleException(res,e)
    }
  },
};
