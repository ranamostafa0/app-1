import mongoose from "mongoose";
import { IdentityRequestStatusEnum } from "../../common/enum/identityRequest.enum.js";

const identityRequestSchema = new mongoose.Schema(
  {
    messageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      required: true,
      unique: true, //one original message can have only one identity request.
    },

    // The receiver of the original anonymous message
    // who wants to know the sender's identity.
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // The sender of the original anonymous message.
    // This user must accept or reject the request.
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: Object.values(IdentityRequestStatusEnum),
      default: IdentityRequestStatusEnum.Pending,
    },
  },
  { collection: "identityRequests", timestamps: true },
);

export const IdentityRequestModel = mongoose.model(
  "IdentityRequest",
  identityRequestSchema,
);
