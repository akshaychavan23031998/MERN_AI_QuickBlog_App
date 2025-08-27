import mongoose from "mongoose";

const commentsSchema = new mongoose.Schema(
  {
    blog: { type: mongoose.Schema.Types.ObjectId, ref: "blog", required: true },
    name: { type: String, required: true },
    content: { type: String, required: true },
    isApproved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Comment = mongoose.model("Comment", commentsSchema);

export default Comment;
