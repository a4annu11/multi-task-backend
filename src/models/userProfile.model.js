import mongoose from "mongoose";

const userProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      required: true,
    },
    fullName: {
      type: String,
    },
    bio: {
      type: String,
    },
    profileImage: {
      type: String,
    },
    coverImage: {
      type: String,
    },
    website: {
      type: String,
    },
    location: {
      type: String,
    },
    dob: {
      type: Date,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    followerCount: {
      type: Number,
      default: 0,
    },
    followingCount: {
      type: Number,
      default: 0,
    },
    postCount: {
      type: Number,
      default: 0,
    },
    subscriberCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const UserProfile = mongoose.models.UserProfile || mongoose.model("UserProfile", userProfileSchema);
