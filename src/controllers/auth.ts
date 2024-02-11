import { NextFunction, Request, Response } from "express";
import { UserRegistrationValidationSchema } from "../validators/profile";
import { AuthService } from "../services/auth";
import { AuthIssueKeys, ClientIssue, handleException, resAsClientIssue } from "../config/ClientIssue";
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
      console.log("RegistrationAPICalled", req.body);
      let { error, value } = UserRegistrationValidationSchema.validate(
        req.body
      );
      if (error || !value) {
        console.log(error, value, "A");
        return res.status(400).json({ error: error?.details[0].message });
      }
      let token = await AuthService.registerUser(value);
      res.status(200).json({
        token: token,
      });
    } catch (e: any) {
      handleException(res,e)
    }
  },
};
