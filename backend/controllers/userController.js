import User from "../models/userModel.js";
import ActivityLog from "../models/activityLogModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import catchAsync from "../middleware/catchAsync.js";
import { OAuth2Client } from "google-auth-library";

const sendToken = (user, statusCode, res) => {
  const token = user.getJWTToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    sameSite: "lax",
  };

  const { password, ...userWithoutPassword } = user.toObject();

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    user: userWithoutPassword,
    token,
  });
};

const getGoogleClient = () => new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Register
export const registerUser = catchAsync(async (req, res, next) => {
  const { name, email, password, referredBy } = req.body;

  const referralCode = `ALI${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  const user = await User.create({ name, email, password, referredBy: referredBy || "", referralCode });

  sendToken(user, 201, res);
});

// Login
export const loginUser = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Please enter email and password", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  sendToken(user, 200, res);
});

// Google Sign-in / Register
export const googleAuth = catchAsync(async (req, res, next) => {
  const { credential } = req.body;

  if (!process.env.GOOGLE_CLIENT_ID) {
    return next(new ErrorHandler("Google Sign-In is not configured", 500));
  }

  if (!credential) {
    return next(new ErrorHandler("Missing Google credential", 400));
  }

  let payload;
  try {
    const client = getGoogleClient();
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch {
    return next(new ErrorHandler("Invalid Google token", 401));
  }

  const email = (payload?.email || "").toLowerCase();
  const emailVerified = Boolean(payload?.email_verified);
  const googleId = payload?.sub || "";

  if (!email || !emailVerified) {
    return next(new ErrorHandler("Google account email is not verified", 401));
  }

  const displayName = payload?.name || email.split("@")[0];
  const avatar = payload?.picture || "";

  let user = await User.findOne({ email });

  if (!user) {
    const referralCode = `ALI${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    user = await User.create({
      name: displayName,
      email,
      authProvider: "google",
      googleId,
      avatar,
      referralCode,
    });
  } else {
    const updates = {};
    if (!user.googleId && googleId) updates.googleId = googleId;
    if (!user.avatar && avatar) updates.avatar = avatar;
    if (user.authProvider === "google" && user.name !== displayName && displayName) updates.name = displayName;
    if (Object.keys(updates).length > 0) {
      user = await User.findByIdAndUpdate(user._id, updates, { new: true });
    }
  }

  sendToken(user, 200, res);
});

// Logout
export const logoutUser = catchAsync(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

// Get User Profile
export const getUserProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  res.status(200).json({
    success: true,
    user,
  });
});

// Update Profile
export const updateProfile = catchAsync(async (req, res, next) => {
  const newData = {
    name: req.body.name,
    email: req.body.email,
  };

  const user = await User.findByIdAndUpdate(req.user._id, newData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    user,
  });
});

// Get All Users -- Admin
export const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    success: true,
    users,
  });
});

// Delete User -- Admin
export const deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  await ActivityLog.create({
    user: req.user._id,
    action: "DELETE_USER",
    entityType: "User",
    entityId: user._id,
    details: `Deleted user "${user.name}" (${user.email})`,
  });

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});

// Update User Role -- Admin
export const updateUserRole = catchAsync(async (req, res, next) => {
  const { role } = req.body;

  if (!role || !["admin", "user"].includes(role)) {
    return next(new ErrorHandler("Please provide a valid role", 400));
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  const oldRole = user.role;
  user.role = role;
  await user.save({ validateBeforeSave: false });

  await ActivityLog.create({
    user: req.user._id,
    action: "UPDATE_USER_ROLE",
    entityType: "User",
    entityId: user._id,
    details: `Changed "${user.name}" role from ${oldRole} to ${role}`,
  });

  res.status(200).json({
    success: true,
    message: `User role updated to ${role}`,
  });
});

// Get User Addresses
export const getAddresses = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.status(200).json({ success: true, addresses: user.addresses || [] });
});

// Add Address
export const addAddress = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.addresses.push(req.body);
  await user.save({ validateBeforeSave: false });
  res.status(201).json({ success: true, addresses: user.addresses });
});

// Delete Address
export const deleteAddress = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  user.addresses = user.addresses.filter(
    (addr) => addr._id.toString() !== req.params.addressId
  );
  await user.save({ validateBeforeSave: false });
  res.status(200).json({ success: true, addresses: user.addresses });
});

// Loyalty Summary
export const getLoyaltyProfile = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.status(200).json({
    success: true,
    loyalty: {
      points: user.loyaltyPoints || 0,
      tier: user.loyaltyTier || "Bronze",
      referralCode: user.referralCode || "",
    },
  });
});
