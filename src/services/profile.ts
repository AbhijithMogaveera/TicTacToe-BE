import { UserDocument, UserRegistrationMongoModel } from "../schema/auth";

export async function findUserByUsername(
  username: string
): Promise<UserDocument | null> {
  try {
    const user = await UserRegistrationMongoModel.findOne({ username });
    if (!user) {
      return null;
    }
    return user;
  } catch (error: any) {
    throw new Error(`Error finding user: ${error?.message}`);
  }
}
