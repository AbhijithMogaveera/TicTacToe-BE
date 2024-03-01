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
  profile_picture: {
    type: String,
    default: undefined,
  },
  password:{
    type:String,
    required:true
  }
});

export const UserRegistrationMongoModel = mongoose.model<UserDocument>("User", userSchema);
