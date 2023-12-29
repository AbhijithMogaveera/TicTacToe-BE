import mongoose, { mongo } from "mongoose";
import { UserRegistration } from "../models/profile";


export interface UserDocument extends Document, UserRegistration {}

const userSchema = new mongoose.Schema<UserDocument>({
  user_name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  bio: {
    type: String,
    default: "",
  },
  profilePicture: {
    type: String,
    default: "default_profile_picture_url.jpg",
  },
  password:{
    type:String,
    required:true
  }
});

export const UserRegistrationMongoModel = mongoose.model<UserDocument>("User", userSchema);
