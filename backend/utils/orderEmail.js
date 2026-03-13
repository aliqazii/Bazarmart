import nodemailer from "nodemailer";

const createTransporter = () => {
  const host = process.env.SMTP_HOST || process.env.EMAIL_HOST;
  const port = Number(process.env.SMTP_PORT || process.env.EMAIL_PORT || 587);
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASSWORD || process.env.EMAIL_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
};

export const sendOrderConfirmationEmail = async ({ to, order }) => {
  if (!to) return false;

  const transporter = createTransporter();
  if (!transporter) return false;

  const items = (order.orderItems || [])
    .map((item) => `- ${item.name} x${item.quantity} ($${Number(item.price).toFixed(2)})`)
    .join("\n");

  const subject = `Bazarmart Order Confirmation #${String(order._id).slice(-8)}`;
  const text = [
    `Thank you for your order, ${order.user?.name || "Customer"}.`,
    "",
    `Order ID: ${order._id}`,
    `Payment Method: ${order.paymentInfo?.method || "N/A"}`,
    `Payment Status: ${order.paymentInfo?.status || "N/A"}`,
    `Total Amount: $${Number(order.totalPrice || 0).toFixed(2)}`,
    "",
    "Items:",
    items || "- No items",
    "",
    "Shipping Address:",
    `${order.shippingInfo?.address || ""}, ${order.shippingInfo?.city || ""}, ${order.shippingInfo?.state || ""}`,
    `${order.shippingInfo?.country || ""} ${order.shippingInfo?.pinCode || ""}`,
    "",
    "We will notify you as your order status updates.",
  ].join("\n");

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER || process.env.EMAIL_USER,
    to,
    subject,
    text,
  });

  return true;
};
