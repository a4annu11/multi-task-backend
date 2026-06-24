import bcrypt from "bcryptjs";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendEmail } from "../utils/sendEmail.js";

const generateToken = async (userId) => {
  const user = await User.findById(userId);
  const accessToken = user.generateAccessToken();
  return { accessToken };
};

export const signup = asyncHandler(async (req, res) => {
  const { username, email, password, phone } = req.body;

  if ([username, email, password].some((field) => !field || field.trim() === "")) {
    throw new ApiError(400, "Username, email and password are required");
  }

  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existingUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  const user = await User.create({
    username: username.toLowerCase(),
    email: email.toLowerCase(),
    password,
    phone,
  });

  const createdUser = await User.findById(user._id).select("-password -verifyToken -verifyTokenExpiry");

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  // Generate a 6-digit verification code
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedCode = await bcrypt.hash(verificationCode, 10);

  user.verifyToken = hashedCode;
  user.verifyTokenExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  await user.save({ validateBeforeSave: false });

  // Send verification email
  const message = `
    <h2>Welcome ${user.username}!</h2>
    <p>Please use the following 6-digit code to verify your email address:</p>
    <h3>${verificationCode}</h3>
    <p>This code is valid for 24 hours.</p>
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: "Verify your email address",
      message,
    });
  } catch (error) {
    user.verifyToken = undefined;
    user.verifyTokenExpiry = undefined;
    await user.save({ validateBeforeSave: false });
    
    // We don't want to throw an error and fail the signup if email fails, 
    // just return the response indicating the email wasn't sent
    return res.status(201).json(
      new ApiResponse(201, createdUser, "User registered successfully. However, the verification email could not be sent.")
    );
  }

  return res.status(201).json(
    new ApiResponse(201, createdUser, "User registered successfully. Please check your email to verify.")
  );
});

export const signin = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!email && !username) {
    throw new ApiError(400, "Username or email is required");
  }

  if (!password) {
    throw new ApiError(400, "Password is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken } = await generateToken(user._id);

  const loggedInUser = await User.findById(user._id).select("-password -verifyToken -verifyTokenExpiry");

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
        },
        "User logged in successfully"
      )
    );
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    throw new ApiError(400, "Email and verification code are required");
  }

  const user = await User.findOne({
    email,
    verifyTokenExpiry: { $gt: Date.now() },
  });

  if (!user || !user.verifyToken) {
    throw new ApiError(400, "Invalid or expired verification code");
  }

  const isCodeValid = await bcrypt.compare(code, user.verifyToken);

  if (!isCodeValid) {
    throw new ApiError(400, "Invalid verification code");
  }

  user.isEmailVerified = true;
  user.verifyToken = undefined;
  user.verifyTokenExpiry = undefined;

  await user.save({ validateBeforeSave: false });

  return res.status(200).json(new ApiResponse(200, {}, "Email verified successfully"));
});
