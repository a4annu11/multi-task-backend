import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createPost } from "../controllers/post.controller.js";
import { postUpload } from "../middlewares/upload.middleware.js";

const router = express.Router();

router.post("/create", verifyJWT, postUpload, createPost);

export default router;
