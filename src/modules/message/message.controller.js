import { Router } from "express";
import {
  acceptIdentityRequest,
  getConversationMessages,
  getIdentityRequests,
  getReceivedMessages,
  rejectIdentityRequest,
  requestSenderIdentity,
  sendAnonymousMessage,
  sendConversationMessage,
} from "./message.service.js";
import { authentication } from "../../middleware/auth.middleware.js";
import { successResponse } from "../../common/utils/response/success.response.js";
const router = Router();

// 1. Send anonymous message
router.post("/:receiverId", authentication(), async (req, res, next) => {
  const result = await sendAnonymousMessage(
    req.params.receiverId,
    req.user._id,
    req.body.content,
  );

  return successResponse({
    res,
    status: 201,
    message: "Anonymous message sent successfully",
    data: result,
  });
});

router.get("/received", authentication(), async (req, res) => {
  const result = await getReceivedMessages(req.user._id);

  return successResponse({ res, data: result });
});

router.post(
  "/:messageId/identity-request",
  authentication(),
  async (req, res) => {
    const result = await requestSenderIdentity(
      req.params.messageId,
      req.user._id,
    );

    return successResponse({
      res,
      status: 201,
      message: "Identity request sent successfully",
      data: result,
    });
  },
);

router.get("/identity-requests", authentication(), async (req, res) => {
  const result = await getIdentityRequests(req.user._id);

  return successResponse({ res, data: result });
});

router.patch(
  "/identity-request/:requestId/reject",
  authentication(),
  async (req, res) => {
    const result = await rejectIdentityRequest(
      req.params.requestId,
      req.user._id,
    );

    return successResponse({
      res,
      message: "Identity request rejected successfully",
      data: result,
    });
  },
);

router.patch(
  "/identity-request/:requestId/accept",
  authentication(),
  async (req, res) => {
    const result = await acceptIdentityRequest(
      req.params.requestId,
      req.user._id,
    );

    return successResponse({
      res,
      message: "Identity request accepted successfully",
      data: result,
    });
  },
);

/////////////////////////////////////////////CONVERSATION/////////////////////////////////
router.post(
  "/conversations/:conversationId/messages",
  authentication(),
  async (req, res) => {
    const result = await sendConversationMessage(
      req.params.conversationId,
      req.user._id,
      req.body.content,
    );

    return successResponse({
      res,
      status: 201,
      message: "Message sent successfully",
      data: result,
    });
  },
);

router.get(
  "/conversations/:conversationId/messages",
  authentication(),
  async (req, res) => {
    const result = await getConversationMessages(
      req.params.conversationId,
      req.user._id,
    );

    return successResponse({ res, data: result });
  },
);

export default router;
