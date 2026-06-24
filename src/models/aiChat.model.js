import mongoose from "mongoose";

const aiChatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
    },
  },
  { timestamps: true }
);

aiChatSchema.index({ createdAt: -1 });

export const AIChat = mongoose.models.AIChat || mongoose.model("AIChat", aiChatSchema);
