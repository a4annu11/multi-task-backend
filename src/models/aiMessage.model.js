import mongoose from "mongoose";

const aiMessageSchema = new mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AIChat",
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["user", "assistant"],
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

aiMessageSchema.index({ createdAt: 1 });

export const AIMessage = mongoose.models.AIMessage || mongoose.model("AIMessage", aiMessageSchema);
