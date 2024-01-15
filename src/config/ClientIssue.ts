import { error } from "console";
import { Response, response } from "express";
import { any } from "joi";
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
  PasswordIsRequired:"password_is_required"
};


export function resAsClientIssue({
  res,
  issue,
  status = 400,
}: {
  res: any;
  issue: ClientIssue;
  status?: number;
}) {
  res.status(status).json(issue);
}

export function handleException(res: Response, e: any) {
  if (e instanceof ClientError) {
    let issue: ClientIssue = {
      key: e.key,
      message: e.message,
    };
    resAsClientIssue({
      res: res,
      issue: issue,
    });
  } else {
    res.status(500).send({
      message: "somthing went wrong",
    });
  }
  console.log(e);
}
