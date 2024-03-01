import express from "express"
import { validateToken } from "../middleware/jwt"
import { ProfileContorller } from "../controllers/profile"
import { upload } from "../storage/disk_storage"

export const ProfileRouter = express.Router()

ProfileRouter.put(
    '/', 
    validateToken, 
    upload.single("profile_image"), 
    ProfileContorller.updateProfile, 
    ProfileContorller.getProfileDetails
)

ProfileRouter.get(
    '/:user_name', 
    validateToken, 
    ProfileContorller.getProfileDetails
)

ProfileRouter.get(
    '/', 
    validateToken, 
    ProfileContorller.getProfileDetails
)