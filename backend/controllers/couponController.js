import Coupon from "../models/couponModel.js";
import ActivityLog from "../models/activityLogModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import catchAsync from "../middleware/catchAsync.js";

// Create Coupon -- Admin
export const createCoupon = catchAsync(async (req, res, next) => {
  const coupon = await Coupon.create(req.body);

  await ActivityLog.create({
    user: req.user._id,
    action: "CREATE_COUPON",
    entityType: "Coupon",
    entityId: coupon._id,
    details: `Created coupon ${coupon.code} (${coupon.discount}% off)`,
  });

  res.status(201).json({ success: true, coupon });
});

// Get All Coupons -- Admin
export const getAllCoupons = catchAsync(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.status(200).json({ success: true, coupons });
});

// Validate Coupon (user)
export const validateCoupon = catchAsync(async (req, res, next) => {
  const { code, orderTotal } = req.body;

  if (!code) {
    return next(new ErrorHandler("Please provide a coupon code", 400));
  }

  const coupon = await Coupon.findOne({ code: code.toUpperCase(), active: true });

  if (!coupon) {
    return next(new ErrorHandler("Invalid or inactive coupon code", 400));
  }

  if (coupon.expiresAt < new Date()) {
    return next(new ErrorHandler("This coupon has expired", 400));
  }

  if (coupon.usedCount >= coupon.maxUses) {
    return next(new ErrorHandler("This coupon has reached its usage limit", 400));
  }

  if (orderTotal < coupon.minAmount) {
    return next(new ErrorHandler(`Minimum order amount for this coupon is $${coupon.minAmount}`, 400));
  }

  res.status(200).json({
    success: true,
    discount: coupon.discount,
    code: coupon.code,
  });
});

// Use Coupon (increment count) -- called internally after order placement
export const useCoupon = async (code) => {
  if (!code) return;
  await Coupon.findOneAndUpdate(
    { code: code.toUpperCase() },
    { $inc: { usedCount: 1 } }
  );
};

// Delete Coupon -- Admin
export const deleteCoupon = catchAsync(async (req, res, next) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    return next(new ErrorHandler("Coupon not found", 404));
  }

  await ActivityLog.create({
    user: req.user._id,
    action: "DELETE_COUPON",
    entityType: "Coupon",
    entityId: coupon._id,
    details: `Deleted coupon ${coupon.code}`,
  });

  await coupon.deleteOne();
  res.status(200).json({ success: true, message: "Coupon deleted" });
});
