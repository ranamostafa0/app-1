import mongoose from "mongoose";

const conversationMessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    content: { type: String, required: true, trim: true },
  },
  { collection: "conversationMessages", timestamps: true },
);

export const ConversationMessageModel = mongoose.model(
  "ConversationMessage",
  conversationMessageSchema,
);

// Each conversation message belongs to:
// - One conversation.
// - One sender.
// We don't need to store the receiver ID here because we can get the other participant from the conversation.
