import mongoose from "mongoose";

const deviceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    fcmToken: {
      type: String,
      required: true,
      index: true,
    },
    platform: {
      type: String,
      enum: ["android", "ios", "web"],
    },
  },
  { timestamps: true }
);

export const Device = mongoose.models.Device || mongoose.model("Device", deviceSchema);
