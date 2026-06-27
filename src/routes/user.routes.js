import express from "express";

const router = express.Router();

import {
  getUserProfile,
  updateUserProfile,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { profileUpload } from "../middlewares/upload.middleware.js";

router.get("/profile", verifyJWT, getUserProfile);
router.put("/update", verifyJWT, profileUpload, updateUserProfile);

export default router;
