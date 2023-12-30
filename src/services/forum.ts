import { ForumPostPostRequest } from "../models/forum";
import { ForumPostModel } from "../schema/forum";

export const ForumService = {
  async addPostToForum({
    httpReq,
    postedBy,
  }: {
    httpReq: ForumPostPostRequest;
    postedBy: string;
  }) {
    let id: string = (
      await ForumPostModel.create({
        ...httpReq,
        posted_by: postedBy,
        posted_on: Date.now(),
      })
    )._id.toString();
    return id;
  },

  async removePostFromFourum({ id }: { id: string }) {
    await ForumPostModel.findByIdAndDelete(id);
  },

  async getPosts({
    limit,
    after_post_id,
  }: {
    limit: number;
    after_post_id?: string;
  }) {
    const query = after_post_id ? { _id: { $gt: after_post_id } } : {};
    const posts = await ForumPostModel.find(query)
      .sort({ postedOn: 1 })
      .limit(limit)
      .exec();
    return posts;
  },

};

