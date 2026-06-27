import { UserProfile } from "../models/userProfile.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadMedia, destroyMedia } from "../config/cloudinary.js";
import { Follow } from "../models/follow.model.js";

export const updateUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  const existingProfile = await UserProfile.findOne({ userId });

  if (!existingProfile) {
    throw new ApiError(404, "User profile not found");
  }

  const { fullName, bio, website, location, dob, isPrivate } = req.body;

  let profileImage = existingProfile.profileImage;
  let coverImage = existingProfile.coverImage;

  const profileImageFile = req.files?.profileImage?.[0];
  const coverImageFile = req.files?.coverImage?.[0];

  // Upload Profile Image
  if (profileImageFile) {
    const uploadedProfile = await uploadMedia(profileImageFile);

    if (!uploadedProfile) {
      throw new ApiError(500, "Failed to upload profile image");
    }

    if (profileImage?.publicId) {
      await destroyMedia(profileImage.publicId);
    }

    profileImage = uploadedProfile;
  }

  // Upload Cover Image
  if (coverImageFile) {
    const uploadedCover = await uploadMedia(coverImageFile);

    if (!uploadedCover) {
      throw new ApiError(500, "Failed to upload cover image");
    }

    if (coverImage?.publicId) {
      await destroyMedia(coverImage.publicId);
    }

    coverImage = uploadedCover;
  }

  const updateData = {
    ...(fullName !== undefined && { fullName }),
    ...(bio !== undefined && { bio }),
    ...(website !== undefined && { website }),
    ...(location !== undefined && { location }),
    ...(dob !== undefined && { dob }),
    ...(isPrivate !== undefined && { isPrivate }),
    profileImage,
    coverImage,
  };

  const updatedProfile = await UserProfile.findOneAndUpdate(
    { userId },
    {
      $set: updateData,
    },
    {
      new: true,
      runValidators: true,
    },
  ).populate("userId", "username email");

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedProfile, "User profile updated successfully"),
    );
});

export const getUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const profileId = req.query.profileId;
  let profile;

  if (profileId) {
    profile = await UserProfile.findOne({ userId: profileId }).populate(
      "userId",
      "username",
    );

    return res
      .status(200)
      .json(new ApiResponse(200, profile, "User profile fetched successfully"));
  }
  profile = await UserProfile.findOne({ userId }).populate(
    "userId",
    "username",
  );

  if (!profile) {
    throw new ApiError(404, "User profile not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, profile, "User profile fetched successfully"));
});

export const followUnfollowUser = asyncHandler(async (req, res) => {
  const currentUserId = req.user._id;
  const targetUserId = req.params.userId;

  if (currentUserId.toString() === targetUserId) {
    throw new ApiError(400, "You cannot follow yourself");
  }

  const [currentUserProfile, targetUserProfile] = await Promise.all([
    UserProfile.findOne({ userId: currentUserId }),
    UserProfile.findOne({ userId: targetUserId }),
  ]);

  if (!currentUserProfile || !targetUserProfile) {
    throw new ApiError(404, "User profile not found");
  }

  let follow = await Follow.findOne({
    followerId: currentUserId,
    followingId: targetUserId,
  });

  // Already Following -> Unfollow

  if (follow?.status === "accepted") {
    await Follow.findByIdAndDelete(follow._id);

    await UserProfile.updateOne(
      { userId: currentUserId },
      { $inc: { followingCount: -1 } },
    );

    await UserProfile.updateOne(
      { userId: targetUserId },
      { $inc: { followerCount: -1 } },
    );

    return res
      .status(200)
      .json(new ApiResponse(200, null, "User unfollowed successfully"));
  }

  // Pending Request -> Cancel
  if (follow?.status === "pending") {
    await Follow.findByIdAndDelete(follow._id);

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Follow request cancelled"));
  }

  // New Follow Request
  if (!follow) {
    const status = targetUserProfile.isPrivate ? "pending" : "accepted";

    follow = await Follow.create({
      followerId: currentUserId,
      followingId: targetUserId,
      status,
      acceptedAt: status === "accepted" ? new Date() : null,
    });

    if (status === "accepted") {
      await UserProfile.updateOne(
        { userId: currentUserId },
        { $inc: { followingCount: 1 } },
      );

      await UserProfile.updateOne(
        { userId: targetUserId },
        { $inc: { followerCount: 1 } },
      );
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          follow,
          status === "pending"
            ? "Follow request sent."
            : "User followed successfully",
        ),
      );
  }

  // Follow Again (Rejected)
  follow.status = targetUserProfile.isPrivate ? "pending" : "accepted";
  follow.acceptedAt = follow.status === "accepted" ? new Date() : null;

  await follow.save();

  if (follow.status === "accepted") {
    await UserProfile.updateOne(
      { userId: currentUserId },
      { $inc: { followingCount: 1 } },
    );

    await UserProfile.updateOne(
      { userId: targetUserId },
      { $inc: { followerCount: 1 } },
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        follow,
        follow.status === "pending"
          ? "Follow request sent."
          : "User followed successfully",
      ),
    );
});

export const acceptFollowRequest = asyncHandler(async (req, res) => {
  const requestId = req.params.requestId;

  const follow = await Follow.findById(requestId);

  if (!follow) {
    throw new ApiError(404, "Follow request not found");
  }

  if (follow.status !== "pending") {
    throw new ApiError(400, "Request already processed");
  }

  follow.status = "accepted";
  follow.acceptedAt = new Date();

  await follow.save();

  await UserProfile.updateOne(
    { userId: follow.followerId },
    { $inc: { followingCount: 1 } },
  );

  await UserProfile.updateOne(
    { userId: follow.followingId },
    { $inc: { followerCount: 1 } },
  );

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Follow request accepted"));
});
