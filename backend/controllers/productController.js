import Product from "../models/productModel.js";
import ActivityLog from "../models/activityLogModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import catchAsync from "../middleware/catchAsync.js";

// Create Product -- Admin
export const createProduct = catchAsync(async (req, res, next) => {
  req.body.user = req.user._id;
  const product = await Product.create(req.body);

  await ActivityLog.create({
    user: req.user._id,
    action: "CREATE_PRODUCT",
    entityType: "Product",
    entityId: product._id,
    details: `Created product "${product.name}"`,
  });

  res.status(201).json({
    success: true,
    product,
  });
});

// Get All Products (with sort)
export const getAllProducts = catchAsync(async (req, res, next) => {
  const { keyword, category, gender, price, page, sort } = req.query;
  const resultsPerPage = 8;
  const currentPage = Number(page) || 1;
  const skip = resultsPerPage * (currentPage - 1);

  const query = {};

  if (keyword) {
    query.name = { $regex: keyword, $options: "i" };
  }

  if (category) {
    query.category = category;
  }

  if (gender) {
    query.gender = gender;
  }

  if (price) {
    const [gte, lte] = price.split(",");
    query.price = {};
    if (gte) query.price.$gte = Number(gte);
    if (lte) query.price.$lte = Number(lte);
  }

  // Sort options
  let sortOption = { createdAt: -1 }; // default: newest
  if (sort === "price_asc") sortOption = { price: 1 };
  else if (sort === "price_desc") sortOption = { price: -1 };
  else if (sort === "rating") sortOption = { ratings: -1 };
  else if (sort === "popular") sortOption = { numOfReviews: -1 };
  else if (sort === "newest") sortOption = { createdAt: -1 };

  const productsCount = await Product.countDocuments(query);
  const products = await Product.find(query)
    .sort(sortOption)
    .limit(resultsPerPage)
    .skip(skip);

  res.status(200).json({
    success: true,
    products,
    productsCount,
    resultsPerPage,
  });
});

// Search Autocomplete
export const searchAutocomplete = catchAsync(async (req, res) => {
  const { q } = req.query;

  if (!q || q.length < 2) {
    return res.status(200).json({ success: true, suggestions: [] });
  }

  const products = await Product.find({
    name: { $regex: q, $options: "i" },
  })
    .select("name images price category")
    .limit(8);

  res.status(200).json({ success: true, suggestions: products });
});

// Advanced Search (fuzzy-ish ranking)
export const advancedProductSearch = catchAsync(async (req, res) => {
  const q = (req.query.q || "").trim();
  if (!q) return res.status(200).json({ success: true, products: [] });

  const regex = new RegExp(q, "i");
  const products = await Product.find({
    $or: [
      { name: regex },
      { description: regex },
      { category: regex },
      { tags: regex },
      { searchKeywords: regex },
    ],
  }).limit(40);

  const ranked = products
    .map((p) => {
      let score = 0;
      if (p.name?.toLowerCase().includes(q.toLowerCase())) score += 5;
      if (p.description?.toLowerCase().includes(q.toLowerCase())) score += 2;
      score += p.ratings || 0;
      score += Math.min(p.numOfReviews || 0, 100) * 0.02;
      return { p, score };
    })
    .sort((a, b) => b.score - a.score)
    .map((x) => x.p);

  res.status(200).json({ success: true, products: ranked });
});

// Product Recommendations
export const getProductRecommendations = catchAsync(async (req, res, next) => {
  const current = await Product.findById(req.params.id);
  if (!current) return next(new ErrorHandler("Product not found", 404));

  const products = await Product.find({
    _id: { $ne: current._id },
    $or: [
      { category: current.category },
      { price: { $gte: current.price * 0.75, $lte: current.price * 1.25 } },
    ],
  })
    .sort({ ratings: -1, numOfReviews: -1 })
    .limit(8);

  res.status(200).json({ success: true, products });
});

// Get Product Details
export const getProductDetails = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  res.status(200).json({
    success: true,
    product,
  });
});

// Update Product -- Admin
export const updateProduct = catchAsync(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  await ActivityLog.create({
    user: req.user._id,
    action: "UPDATE_PRODUCT",
    entityType: "Product",
    entityId: product._id,
    details: `Updated product "${product.name}"`,
  });

  res.status(200).json({
    success: true,
    product,
  });
});

// Delete Product -- Admin
export const deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  await ActivityLog.create({
    user: req.user._id,
    action: "DELETE_PRODUCT",
    entityType: "Product",
    entityId: product._id,
    details: `Deleted product "${product.name}"`,
  });

  await product.deleteOne();

  res.status(200).json({
    success: true,
    message: "Product deleted successfully",
  });
});
