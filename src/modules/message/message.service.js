import { IdentityRequestStatusEnum } from "../../common/enum/identityRequest.enum.js";
import {
  BadException,
  ConflictException,
  ForbiddenException,
  NotfoundException,
} from "../../common/exceptions/error.exception.js";
import { ConversationModel } from "../../DB/model/conversation.model.js";
import { ConversationMessageModel } from "../../DB/model/conversationMessage.model.js";
import { IdentityRequestModel } from "../../DB/model/identityRequest.model.js";
import { MessageModel } from "../../DB/model/message.model.js";
import { UserModel } from "../../DB/model/user.model.js";

export const sendAnonymousMessage = async (receiverId, senderId, content) => {
  console.log({ receiverId, senderId, content });
  // 1. Prevent sending a message to yourself
  if (receiverId.toString() === senderId.toString()) {
    throw BadException("You cannot send a message to yourself");
  }

  // 2. Check if receiver exists
  const receiver = await UserModel.findById(receiverId);
  if (!receiver) {
    throw NotfoundException("Receiver not found");
  }

  // 3. Create the anonymous message
  const message = await MessageModel.create({ senderId, receiverId, content });

  // Do not return senderId to the receiver.
  return {
    _id: message._id,
    content: message.content,
    createdAt: message.createdAt,
  };
};

export const getReceivedMessages = async (receiverId) => {
  const messages = await MessageModel.find({ receiverId })
    .populate("senderId", "firstName lastName email profilePicture")
    .sort({ createdAt: -1 });

  const filterdMessages = messages.map((message) => ({
    _id: message._id,
    content: message.content,
    createdAt: message.createdAt,

    sender: message.anonymous ? null : message.senderId,
  }));

  if (!filterdMessages.length) {
    return { message: "no messages found" };
  }
  return filterdMessages;
};

export const requestSenderIdentity = async (messageId, requesterId) => {
  // 1. Find the requested message
  const message = await MessageModel.findById(messageId);
  if (!message) {
    throw NotfoundException("Message not found");
  }

  // 2. Only the receiver can request the sender's identity
  if (message.receiverId.toString() !== requesterId.toString()) {
    throw ForbiddenException("You cannot request this message identity");
  }

  // 3. Check if identity is already revealed
  if (!message.anonymous) {
    throw ConflictException("Sender identity is already revealed");
  }

  // 4. Check if a request already exists
  const existingRequest = await IdentityRequestModel.findOne({ messageId });
  if (existingRequest) {
    throw ConflictException("Identity request already exists");
  }

  // 5. Create the identity request
  const request = await IdentityRequestModel.create({
    messageId,
    requesterId,
    senderId: message.senderId,
  });

  return request;
};

export const getIdentityRequests = async (senderId) => {
  const requests = await IdentityRequestModel.find({ senderId })
    .populate("requesterId", "firstName lastName email profilePicture")
    .populate("messageId", "content createdAt")
    .sort({ createdAt: -1 });

  return requests;
};

export const rejectIdentityRequest = async (requestId, senderId) => {
  // 1. Find the identity request
  const request = await IdentityRequestModel.findById(requestId);
  if (!request) {
    throw NotfoundException("Identity request not found");
  }

  // 2. Only the original sender can reject
  if (request.senderId.toString() !== senderId.toString()) {
    throw ForbiddenException("You cannot reject this request");
  }

  // 3. Check request status
  if (request.status !== IdentityRequestStatusEnum.Pending) {
    throw ConflictException("Request is already processed");
  }

  // 4. Reject the request
  request.status = IdentityRequestStatusEnum.Rejected;
  await request.save();

  // anonymous remains true
  // no conversation created

  return request;
};

export const acceptIdentityRequest = async (requestId, senderId) => {
  // 1. Find the identity request
  const request = await IdentityRequestModel.findById(requestId);
  if (!request) {
    throw NotfoundException("Identity request not found");
  }

  // 2. Only the original sender can accept
  if (request.senderId.toString() !== senderId.toString()) {
    throw ForbiddenException("You cannot accept this request");
  }

  // 3. Check request status
  if (request.status !== IdentityRequestStatusEnum.Pending) {
    throw ConflictException("Request is already processed");
  }

  // 4. Accept the request
  request.status = IdentityRequestStatusEnum.Accepted;
  await request.save();

  // 5. Reveal the sender identity
  await MessageModel.findByIdAndUpdate(request.messageId, { anonymous: false });

  // Conversation creation will be added here in Part 5.  <<<<<<<<<<<<<<<<<<<<<
  // 3. Create conversation
  const conversation = await ConversationModel.create({
    participants: [request.senderId, request.requesterId],
    originalMessage: request.messageId,
  });
  return { request, conversation };

  // return request;
};

/////////////////////////////////////////////CONVERSATION/////////////////////////////////
// Before allowing a user to send a message, we must check whether they belong to that conversation.
export const sendConversationMessage = async (
  conversationId, //params
  senderId, //authenticated user
  content, //body
) => {
  // 1. Find conversation and check participation
  // Find the conversation with this ID, but only if the current user is one of its participants.
  const conversation = await ConversationModel.findOne({
    _id: conversationId,
    participants: senderId,
  });

  if (!conversation) {
    throw ForbiddenException("You cannot access this conversation");
  }

  // 2. Create conversation message
  const message = await ConversationMessageModel.create({
    conversationId,
    senderId,
    content,
  });

  return message;
};

// Get Conversation Messages
// Both users involved in a conversation should be able to retrieve its messages.
// >>>> But another user must not be able to retrieve those messages.
// Therefore, we use the same authorization check before retrieving anything.
export const getConversationMessages = async (conversationId, userId) => {
  // 1. Check conversation access
  const conversation = await ConversationModel.findOne({
    _id: conversationId,
    participants: userId,
  });

  if (!conversation) {
    throw ForbiddenException("You cannot access this conversation");
  }

  // 2. Get conversation messages
  const messages = await ConversationMessageModel.find({ conversationId })
    .populate("senderId", "firstName lastName profilePicture")
    .sort({ createdAt: 1 });

  return messages;
};
