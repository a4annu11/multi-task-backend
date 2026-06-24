import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["post", "reel"],
      default: "post",
      index: true,
    },
    caption: {
      type: String,
    },
    media: [
      {
        url: String,
        mediaType: {
          type: String,
          enum: ["image", "video"],
        },
      },
    ],
    hashtags: [String],
    location: {
      type: String,
    },
    visibility: {
      type: String,
      enum: ["public", "followers", "subscribers"],
      default: "public",
      index: true,
    },
    isPaidContent: {
      type: Boolean,
      default: false,
    },
    subscriptionPlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubscriptionPlan",
    },
    likeCount: {
      type: Number,
      default: 0,
    },
    commentCount: {
      type: Number,
      default: 0,
    },
    saveCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

postSchema.index({ createdAt: -1 });

export const Post = mongoose.models.Post || mongoose.model("Post", postSchema);
