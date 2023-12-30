import Joi from "joi";
import { ForumPostPostRequest } from "../models/forum";

export const ForumPostValidation = Joi.object<ForumPostPostRequest>({
    description:Joi.required()
})