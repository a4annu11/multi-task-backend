import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendEmail } from "../utils/sendEmail.js";
import { generateAccessToken } from "../utils/generateToken.js";
import { verificationEmailTemplate } from "../templates/verificationEmail.template.js";
import { UserProfile } from "../models/userProfile.model.js";

export const signup = asyncHandler(async (req, res) => {
  const { username, email, password, phone } = req.body;

  if (
    [username, email, password].some((field) => !field || field.trim() === "")
  ) {
    throw new ApiError(400, "Username, email and password are required");
  }

  const existingUser = await User.findOne({
    $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }],
  });

  if (existingUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    username: username.toLowerCase(),
    email: email.toLowerCase(),
    password: hashedPassword,
    phone,
  });

  // Generate verification code
  const verificationCode = Math.floor(
    100000 + Math.random() * 900000,
  ).toString();

  const hashedCode = await bcrypt.hash(verificationCode, 10);

  user.verifyCode = hashedCode;
  user.verifyCodeExpiry = Date.now() + 24 * 60 * 60 * 1000;

  await user.save({ validateBeforeSave: false });
  await UserProfile.create({ userId: user._id });

  const createdUser = await User.findById(user._id).select(
    "-password -verifyCode -verifyCodeExpiry",
  );

  const message = verificationEmailTemplate(user.username, verificationCode);

  try {
    await sendEmail({
      email: user.email,
      subject: "Verify your email address",
      message,
    });
  } catch (error) {
    user.verifyCode = undefined;
    user.verifyCodeExpiry = undefined;

    await user.save({ validateBeforeSave: false });

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          createdUser,
          "User registered successfully but verification email could not be sent.",
        ),
      );
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        createdUser,
        "User registered successfully. Please verify your email.",
      ),
    );
});

export const signin = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!email && !username) {
    throw new ApiError(400, "Email or username is required");
  }

  if (!password) {
    throw new ApiError(400, "Password is required");
  }

  const user = await User.findOne({
    $or: [
      ...(email ? [{ email: email.toLowerCase() }] : []),
      ...(username ? [{ username: username.toLowerCase() }] : []),
    ],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }
  console.log("USER: ", user);

  if (user && !user.isEmailVerified) {
    throw new ApiError(401, "Please verify your email first");
  }

  const accessToken = generateAccessToken(user);

  const loggedInUser = await User.findById(user._id).select(
    "-password -verifyCode -verifyCodeExpiry",
  );

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
        },
        "User logged in successfully",
      ),
    );
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    throw new ApiError(400, "Email and verification code are required");
  }

  const user = await User.findOne({
    email: email.toLowerCase(),
    verifyCodeExpiry: {
      $gt: Date.now(),
    },
  });

  if (!user || !user.verifyCode) {
    throw new ApiError(400, "Invalid or expired verification code");
  }

  const isCodeValid = await bcrypt.compare(code, user.verifyCode);

  if (!isCodeValid) {
    throw new ApiError(400, "Invalid verification code");
  }

  user.isEmailVerified = true;
  user.verifyCode = undefined;
  user.verifyCodeExpiry = undefined;

  await user.save({
    validateBeforeSave: false,
  });

  // await UserProfile.findOneAndUpdate(
  //   { userId: user._id },
  //   {
  //     $setOnInsert: {
  //       userId: user._id,
  //     },
  //   },
  //   {
  //     upsert: true,
  //     new: true,
  //   },
  // );

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Email verified successfully"));
});

export const logout = asyncHandler(async (req, res) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});
