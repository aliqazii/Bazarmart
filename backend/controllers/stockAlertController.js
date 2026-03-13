import StockAlert from "../models/stockAlertModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import catchAsync from "../middleware/catchAsync.js";

// Subscribe to stock alert
export const subscribeStockAlert = catchAsync(async (req, res, next) => {
  const { productId } = req.body;

  if (!productId) {
    return next(new ErrorHandler("Please provide productId", 400));
  }

  await StockAlert.findOneAndUpdate(
    { user: req.user._id, product: productId },
    { email: req.user.email, notified: false },
    { upsert: true, new: true }
  );

  res.status(200).json({ success: true, message: "You will be notified when this product is back in stock" });
});

// Check if user has alert for product
export const checkStockAlert = catchAsync(async (req, res) => {
  const alert = await StockAlert.findOne({
    user: req.user._id,
    product: req.params.productId,
    notified: false,
  });

  res.status(200).json({ success: true, subscribed: !!alert });
});
