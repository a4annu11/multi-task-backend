import express from "express";

const router = express.Router();

import {
  followUnfollowUser,
  getUserProfile,
  handleAcceptRejectFollowRequest,
  updateUserProfile,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { profileUpload } from "../middlewares/upload.middleware.js";

router.get("/profile", verifyJWT, getUserProfile);
router.put("/update", verifyJWT, profileUpload, updateUserProfile);

//follow and unfollow routes
router.post("/follow/:userId", verifyJWT, followUnfollowUser);
router.patch(
  "/follow-request/:requestId",
  verifyJWT,
  handleAcceptRejectFollowRequest,
);

export default router;
