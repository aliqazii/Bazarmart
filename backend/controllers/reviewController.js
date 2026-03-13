import Review from "../models/reviewModel.js";
import Product from "../models/productModel.js";
import Order from "../models/orderModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import catchAsync from "../middleware/catchAsync.js";

// Create or Update Review
export const createReview = catchAsync(async (req, res, next) => {
  const { rating, comment, productId } = req.body;

  if (!rating || !comment || !productId) {
    return next(new ErrorHandler("Please provide rating, comment, and productId", 400));
  }

  // Check if user has purchased this product
  const orders = await Order.find({
    user: req.user._id,
    "orderItems.product": productId,
    orderStatus: "Delivered",
  });

  if (orders.length === 0) {
    return next(new ErrorHandler("You can only review products you have purchased and received", 400));
  }

  // Upsert review
  const review = await Review.findOneAndUpdate(
    { user: req.user._id, product: productId },
    { rating: Number(rating), comment },
    { upsert: true, new: true, runValidators: true }
  );

  // Recalculate product ratings
  const allReviews = await Review.find({ product: productId });
  const avgRating = allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length;

  await Product.findByIdAndUpdate(productId, {
    ratings: Math.round(avgRating * 10) / 10,
    numOfReviews: allReviews.length,
  });

  res.status(201).json({ success: true, review });
});

// Get Reviews for a Product
export const getProductReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.find({ product: req.params.productId })
    .populate("user", "name")
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, reviews });
});

// Delete Review
export const deleteReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new ErrorHandler("Review not found", 404));
  }

  if (review.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    return next(new ErrorHandler("You can only delete your own reviews", 403));
  }

  const productId = review.product;
  await review.deleteOne();

  // Recalculate
  const allReviews = await Review.find({ product: productId });
  const avgRating = allReviews.length > 0
    ? allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length
    : 0;

  await Product.findByIdAndUpdate(productId, {
    ratings: Math.round(avgRating * 10) / 10,
    numOfReviews: allReviews.length,
  });

  res.status(200).json({ success: true, message: "Review deleted" });
});
