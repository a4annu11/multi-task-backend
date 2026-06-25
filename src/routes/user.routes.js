import express from "express";

const router = express.Router();

import {
  getUserProfile,
  updateUserProfile,
} from "../controllers/user.controller.js";

router.get("/profile", getUserProfile);
router.put("/profile", updateUserProfile);

export default router;
