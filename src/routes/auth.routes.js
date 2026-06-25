import exprees from "express";
import { signin, signup, verifyEmail } from "../controllers/auth.controller.js";

const router = exprees.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/verify-email", verifyEmail);

export default router;
