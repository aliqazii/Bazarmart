import Wishlist from "../models/wishlistModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import catchAsync from "../middleware/catchAsync.js";

// Get Wishlist
export const getWishlist = catchAsync(async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id }).populate(
    "products",
    "name price images ratings numOfReviews category stock"
  );

  res.status(200).json({
    success: true,
    products: wishlist ? wishlist.products : [],
  });
});

// Toggle Wishlist (add/remove)
export const toggleWishlist = catchAsync(async (req, res, next) => {
  const { productId } = req.body;

  if (!productId) {
    return next(new ErrorHandler("Please provide productId", 400));
  }

  let wishlist = await Wishlist.findOne({ user: req.user._id });

  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user._id, products: [productId] });
    return res.status(200).json({ success: true, added: true, message: "Added to wishlist" });
  }

  const index = wishlist.products.indexOf(productId);

  if (index > -1) {
    wishlist.products.splice(index, 1);
    await wishlist.save();
    return res.status(200).json({ success: true, added: false, message: "Removed from wishlist" });
  }

  wishlist.products.push(productId);
  await wishlist.save();
  res.status(200).json({ success: true, added: true, message: "Added to wishlist" });
});
