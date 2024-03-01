import { UserDocument, UserRegistrationMongoModel } from "../schema/auth";

export async function findUserByUsername(
  username: string
): Promise<UserDocument | null> {
  try {
    const user = await UserRegistrationMongoModel.findOne({
      user_name: username,
    });
    if (!user) {
      return null;
    }
    
    user.profile_picture =( process.env.SERVER_DNS_URL??"") + user.profile_picture;
    return user;
  } catch (error: any) {
    throw new Error(`Error finding user: ${error?.message}`);
  }
}

export async function updateProfileDeatils({
  profile_image_path,
  bio,
  user_name,
}: {
  profile_image_path?: string;
  bio: string;
  user_name: string;
}) {
  let updateReq: any = {};
  if (profile_image_path) {
    updateReq.profile_picture = profile_image_path;
  }
  if (bio) {
    updateReq.bio = bio;
  }
  await UserRegistrationMongoModel.findOneAndUpdate({ user_name }, updateReq);
}

export async function deleteProfileImage(user_name: string) {
  await UserRegistrationMongoModel.findOneAndUpdate(
    { user_name },
    { profile_picture: undefined }
  );
}
