import { NextFunction, Request, Response } from "express";
import { UserRegistrationValidationSchema } from "../validators/profile";
import { AuthService } from "../services/auth";

export const AuthRestContoller = {
  async loginRoute(req: Request, res: Response) {
    try {
      if (!req.body.user_name) {
        res.status(400).json({ message: "user_name is required" });
        return;
      }
      if (!req.body.password) {
        res.status(400).json({ message: "password is required" });
        return;
      }
      const user_name = req.body.user_name;
      const password = req.body.password;
      const token = await AuthService.loginUser(user_name, password);
      res.status(200).json({
        token: token,
      });
    } catch (e: any) {
      console.log(e);
      res.status(400).json({
        message: e?.message,
      });
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
      console.log(e, "B");
      res.status(400).json({
        message: e?.message,
      });
    }
  },
};
