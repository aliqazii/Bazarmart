import Stripe from "stripe";
import catchAsync from "../middleware/catchAsync.js";

export const processPayment = catchAsync(async (req, res, next) => {
  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(200).json({
      success: true,
      client_secret: "mock_client_secret",
      mode: "mock",
      message: "Stripe key missing, running in mock mode",
    });
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: req.body.amount,
      currency: "usd",
      metadata: { integration_check: "accept_a_payment" },
    });

    return res.status(200).json({
      success: true,
      client_secret: paymentIntent.client_secret,
      mode: "live",
    });
  } catch (error) {
    return res.status(200).json({
      success: true,
      client_secret: "mock_client_secret",
      mode: "mock",
      message: "Stripe unavailable, running in mock mode",
    });
  }
});

export const sendStripeApiKey = catchAsync(async (req, res, next) => {
  res.status(200).json({
    stripeApiKey: process.env.STRIPE_PUBLISHABLE_KEY,
  });
});

export const processLocalPayment = catchAsync(async (req, res) => {
  const { method, amount, accountNumber, accountName } = req.body;
  const supported = ["jazzcash", "easypaisa", "cod"];
  const selected = String(method || "").toLowerCase();

  if (!supported.includes(selected)) {
    return res.status(400).json({ success: false, message: "Unsupported payment method" });
  }

  if (selected !== "cod") {
    const normalizedAccount = String(accountNumber || "").replace(/\D/g, "");
    const normalizedName = String(accountName || "").trim();

    if (!/^03\d{9}$/.test(normalizedAccount)) {
      return res.status(400).json({
        success: false,
        message: "Valid wallet account number is required (03XXXXXXXXX)",
      });
    }

    if (!/^[a-zA-Z\s]{2,}$/.test(normalizedName)) {
      return res.status(400).json({
        success: false,
        message: "Valid account holder name is required",
      });
    }
  }

  const transactionId = `${selected.toUpperCase()}-${Date.now()}`;
  res.status(200).json({
    success: true,
    payment: {
      method: selected,
      transactionId,
      amount,
      status: selected === "cod" ? "Cash on Delivery" : "Pending Verification",
      redirectUrl: `/payment/verify/${transactionId}`,
    },
  });
});
