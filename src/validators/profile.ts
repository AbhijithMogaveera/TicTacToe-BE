import Joi from 'joi';
import { UserRegistration } from '../models/profile';

export const UserRegistrationValidationSchema = Joi.object<UserRegistration>({
  user_name: Joi.string().required(),
  bio: Joi.string().allow('').optional(),
  profile_picture: Joi.string().uri().optional(),
  password:Joi.string().required()
});