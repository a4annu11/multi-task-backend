import { Router } from "express";
import { signin, signup, verifyEmail } from "../controllers/auth.controller.js";

const router = Router();

router.route("/signup").post(signup);
router.route("/signin").post(signin);
router.route("/verify-email").post(verifyEmail);

export default router;
