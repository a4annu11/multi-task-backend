import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Post } from "../models/post.model.js";
import { UserProfile } from "../models/userProfile.model.js";
import { uploadMedia } from "../config/cloudinary.js";

export const createPost = asyncHandler(async (req, res) => {
  const currentUserId = req.user._id;

  if (!currentUserId) {
    throw new ApiError(401, "Unauthorized");
  }

  let {
    caption,
    type,
    location,
    media, // could be parsed media array from body if files are not sent via multer
    hashtags,
    visibility,
    isPaidContent,
    subscriptionPlanId,
  } = req.body;

  // Process uploaded files if any
  let processedMedia = [];
  
  // Parse media from body if it's sent as stringified JSON
  if (media && typeof media === "string") {
    try {
      processedMedia = JSON.parse(media);
    } catch (error) {
      processedMedia = [];
    }
  } else if (Array.isArray(media)) {
    processedMedia = media;
  }

  // Handle file uploads (assuming fields {name: 'media'} or array)
  const files = req.files?.media || (Array.isArray(req.files) ? req.files : []);
  const fileArray = Array.isArray(files) ? files : [files].filter(Boolean);

  if (fileArray.length > 0) {
    const uploadedFiles = await uploadMedia(fileArray);
    const uploadedArray = Array.isArray(uploadedFiles) ? uploadedFiles : [uploadedFiles];

    uploadedArray.forEach((upload, index) => {
      if (upload) {
        const file = fileArray[index];
        const mediaType = file.mimetype?.startsWith("video") ? "video" : "image";
        processedMedia.push({
          url: upload.url,
          mediaType,
        });
      }
    });
  }

  if (!caption && processedMedia.length === 0) {
    throw new ApiError(400, "Post must have either a caption or media");
  }

  // Parse hashtags if sent as string
  let parsedHashtags = [];
  if (hashtags) {
    if (typeof hashtags === "string") {
      parsedHashtags = hashtags.split(",").map((tag) => tag.trim()).filter(Boolean);
    } else if (Array.isArray(hashtags)) {
      parsedHashtags = hashtags;
    }
  }

  // Create Post
  const newPost = await Post.create({
    userId: currentUserId,
    type: type || "post",
    caption: caption || "",
    media: processedMedia,
    hashtags: parsedHashtags,
    location: location || "",
    visibility: visibility || "public",
    isPaidContent: isPaidContent === "true" || isPaidContent === true,
    subscriptionPlanId: subscriptionPlanId || null,
  });

  // Increment user's post count
  await UserProfile.findOneAndUpdate(
    { userId: currentUserId },
    { $inc: { postCount: 1 } }
  );

  return res
    .status(201)
    .json(new ApiResponse(201, newPost, "Post created successfully"));
});

