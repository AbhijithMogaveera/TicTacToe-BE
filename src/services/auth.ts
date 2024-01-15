import { AuthIssueKeys } from "../config/ClientIssue";
import { ClientError } from "../error/error";
import { UserRegistration } from "../models/profile";
import { UserRegistrationMongoModel } from "../schema/auth";
import { TokenManager } from "../util/jwt";

export const AuthService = {
  async registerUser(userData: UserRegistration): Promise<string> {
    try {
      const existingUser = await UserRegistrationMongoModel.findOne({
        user_name: userData.user_name,
      });

      if (existingUser) {
        throw new ClientError(
          "Username already exists. Please choose a different username.",
          AuthIssueKeys.UserAlreadyExist
        );
      }
      const newUser = await UserRegistrationMongoModel.create(userData);
      return TokenManager.signUser({ user_name: newUser.user_name });
    } catch (error: any) {
      throw new Error(`Registration failed: ${error?.message}`);
    }
  },

  async loginUser(user_name: string, password: string): Promise<string | null> {
      const user = await UserRegistrationMongoModel.findOne({ user_name });
      if (!user) {
        throw new ClientError(`Login failed : user ${user_name} not found`, AuthIssueKeys.InvalidUserID);
      }
      if (user.password !== password) {
        throw new ClientError(`Login failed : invalid password`, AuthIssueKeys.InvalidPassword);
      }
      return TokenManager.signUser({ user_name: user.user_name });
  },
};
