import { UserProfile } from "../models/userProfile.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const updateUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const {
    fullName,
    bio,
    profileImage,
    coverImage,
    website,
    location,
    dob,
    isPrivate,
  } = req.body;

  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }
  const updatedProfile = await UserProfile.findByIdAndUpdate(
    userId,
    {
      fullName,
      bio,
      profileImage,
      coverImage,
      website,
      location,
      dob,
      isPrivate,
    },
    { new: true, runValidators: true },
  );

  if (!updatedProfile) {
    throw new ApiError(404, "User profile not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedProfile, "User profile updated successfully"),
    );
});
export const getUserProfile = asyncHandler(async (req, res) => {});
