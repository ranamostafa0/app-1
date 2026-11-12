import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    content: { type: String, required: true, trim: true },
    anonymous:{
      type: Boolean,
      default: true
    }
  },
  { collection: "messages", timestamps: true },
);

export const MessageModel = mongoose.model("Message", messageSchema);

// We need senderId later to:
// 1. Find identity requests received by the sender.
// 2. Check who is allowed to accept or reject a request.
// 3. Create a conversation between the correct two users.
