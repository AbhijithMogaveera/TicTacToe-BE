import { Document } from "mongodb";
import { ForumPost } from "../models/forum";
import mongoose from "mongoose";

interface ForumPostDocument extends Document, ForumPost{}

const ForumPostSchema = new mongoose.Schema<ForumPostDocument>({
    posted_by:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    posted_on:{
        type:Number,
        required:true
    },
})

export const ForumPostModel = mongoose.model<ForumPostDocument>("FourmPosts", ForumPostSchema)