import mongoose from "mongoose";

const messageReadSchema = new mongoose.Schema(
  {
    messageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    readAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

messageReadSchema.index({ messageId: 1, userId: 1 }, { unique: true });

export const MessageRead = mongoose.models.MessageRead || mongoose.model("MessageRead", messageReadSchema);
