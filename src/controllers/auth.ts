import { NextFunction, Request, Response } from "express";
import { loginUser, registerUser } from "../services/auth";
import { UserRegistrationValidationSchema } from "../validators/profile";

export async function loginRoute(
  req: Request,
  res: Response,
  next: NextFunction
) {
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
	const password = req.body.password
    const token = await loginUser(user_name, password);
    res.status(200).json({
      token: token,
    });
  } catch (e: any) {
    console.log(e);
    res.status(400).json({
      message: e?.message,
    });
  }
}

export async function registrationRoute(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("RegistrationAPICalled", req.body);
    let { error, value } = UserRegistrationValidationSchema.validate(req.body);
    if (error || !value) {
      console.log(error, value, "A");
      return res.status(400).json({ error: error?.details[0].message });
    }
    let token = await registerUser(value);
    res.status(200).json({
      token: token,
    });
  } catch (e: any) {
    console.log(e, "B");
    res.status(400).json({
      message: e?.message,
    });
  }
}