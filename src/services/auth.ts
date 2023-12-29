import e from "express";
import { UserRegistration } from "../models/profile";
import {
  UserRegistrationMongoModel,
} from "../schema/auth";
import { TokenManager } from "../util/jwt";

export async function registerUser(
  userData: UserRegistration
): Promise<string> {
  try {
    const existingUser = await UserRegistrationMongoModel.findOne({
      user_name: userData.user_name,
    });

    if (existingUser) {
      throw new Error(
        "Username already exists. Please choose a different username."
      );
    }
    const newUser = await UserRegistrationMongoModel.create(userData);
    return TokenManager.signUser({user_name:newUser.user_name});
  } catch (error: any) {
    throw new Error(`Registration failed: ${error?.message}`);
  }
}

export async function loginUser(user_name: string, password:string): Promise<string|null> {
    try {
      const user = await UserRegistrationMongoModel.findOne({ user_name });  
      if (!user) {
        throw `Login failed : user ${user_name} not found`;
      }
      if(user.password !== password){
        throw `Login failed : invalid password`
      }
      return TokenManager.signUser({user_name:user.user_name});
    } catch (error:any) {
      throw new Error(error);
    }
  }