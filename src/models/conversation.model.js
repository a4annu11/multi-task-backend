import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["single", "group"],
      default: "single",
    },
    groupName: {
      type: String,
    },
    groupImage: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    lastMessageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    lastMessageAt: {
      type: Date,
      index: true,
    },
  },
  { timestamps: true }
);

export const Conversation = mongoose.models.Conversation || mongoose.model("Conversation", conversationSchema);
