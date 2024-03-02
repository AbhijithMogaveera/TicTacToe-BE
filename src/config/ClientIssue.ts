import { Response } from "express";
import { ClientError } from "../error/error";

export interface ClientIssue {
  message: string;
  key: string;
}

export let AuthIssueKeys = {
  InvalidUserID: "invalid_user_id",
  InvalidPassword: "invalid_password",
  UserAlreadyExist: "user_already_exists",
  UserNameIsRequired: "user_name_required",
  PasswordIsRequired: "password_is_required",
  MissingToken:"missing_auth_token",
  InvalidToken:"invalid_token"
};

export function handleException(res: Response, e: any) {
  console.log("Is client side error" + `${e instanceof ClientError}`);
  if (e instanceof ClientError) {
    let issue: ClientIssue = {
      key: e.key,
      message: e.message,
    };
    res.status(400).json(issue);
  } else {
    res.status(500).send({
      message: "somthing went wrong",
    });
  }
  console.log(e);
}
