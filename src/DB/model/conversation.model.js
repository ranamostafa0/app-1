import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    // to keep a reference to the anonymous message that started the conversation.
    originalMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      required: true,
      unique: true,
    },

    // We use an array because it makes authorization checks easy.
    participants: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ],
  },
  { collection: "conversations", timestamps: true },
);

export const ConversationModel = mongoose.model(
  "Conversation",
  conversationSchema,
);
