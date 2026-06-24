import mongoose from "mongoose";

const userSettingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
    },
    allowMessages: {
      type: Boolean,
      default: true,
    },
    showOnlineStatus: {
      type: Boolean,
      default: true,
    },
    notificationLikes: {
      type: Boolean,
      default: true,
    },
    notificationComments: {
      type: Boolean,
      default: true,
    },
    notificationFollows: {
      type: Boolean,
      default: true,
    },
    notificationMessages: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const UserSetting = mongoose.models.UserSetting || mongoose.model("UserSetting", userSettingSchema);
