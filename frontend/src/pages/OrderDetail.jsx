import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { FaDownload } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await axios.get(`/api/v1/orders/${id}`);
        setOrder(data.order);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to fetch order");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const downloadInvoice = () => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(22);
    doc.text("Bazarmart", 14, 22);
    doc.setFontSize(10);
    doc.text("Invoice", 14, 30);
    doc.setFontSize(9);
    doc.text(`Order #${order._id}`, 14, 36);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 14, 42);

    // Shipping info
    doc.setFontSize(11);
    doc.text("Ship To:", 14, 54);
    doc.setFontSize(9);
    doc.text(`${order.shippingInfo.address}`, 14, 60);
    doc.text(`${order.shippingInfo.city}, ${order.shippingInfo.state} ${order.shippingInfo.pinCode}`, 14, 66);
    doc.text(`Phone: ${order.shippingInfo.phoneNo}`, 14, 72);

    // Items table
    autoTable(doc, {
      startY: 80,
      head: [["Item", "Color", "Size", "Qty", "Price", "Total"]],
      body: order.orderItems.map((item) => [
        item.name,
        item.color || "—",
        item.size || "—",
        item.quantity,
        `$${item.price.toFixed(2)}`,
        `$${(item.quantity * item.price).toFixed(2)}`,
      ]),
      theme: "striped",
      headStyles: { fillColor: [26, 26, 46] },
    });

    const y = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.text(`Subtotal: $${order.itemsPrice?.toFixed(2)}`, 140, y);
    doc.text(`Shipping: $${order.shippingPrice?.toFixed(2)}`, 140, y + 6);
    doc.text(`Tax: $${order.taxPrice?.toFixed(2)}`, 140, y + 12);
    if (order.discountAmount > 0) {
      doc.text(`Discount: -$${order.discountAmount.toFixed(2)}`, 140, y + 18);
      doc.setFontSize(12);
      doc.text(`Total: $${order.totalPrice.toFixed(2)}`, 140, y + 26);
    } else {
      doc.setFontSize(12);
      doc.text(`Total: $${order.totalPrice.toFixed(2)}`, 140, y + 20);
    }

    doc.save(`Bazarmart_Invoice_${order._id.slice(-6)}.pdf`);
    toast.success("Invoice downloaded!");
  };

  if (loading) return <div className="loader">Loading...</div>;
  if (!order) return <div className="not-found">Order not found</div>;

  return (
    <div className="order-detail-page">
      <div className="order-detail-header">
        <h1>Order #{order._id}</h1>
        <button className="invoice-btn" onClick={downloadInvoice}>
          <FaDownload /> Download Invoice
        </button>
      </div>

      <div className="order-detail-content">
        <div className="order-section">
          <h2>Shipping Info</h2>
          <p>
            <strong>Address:</strong> {order.shippingInfo.address},{" "}
            {order.shippingInfo.city}, {order.shippingInfo.state}{" "}
            {order.shippingInfo.pinCode}
          </p>
          <p>
            <strong>Phone:</strong> {order.shippingInfo.phoneNo}
          </p>
        </div>

        <div className="order-section">
          <h2>Payment</h2>
          <p className={order.paymentInfo.status === "Paid" || order.paymentInfo.status === "succeeded" ? "text-green" : "text-red"}>
            {order.paymentInfo.status === "Paid" || order.paymentInfo.status === "succeeded"
              ? "PAID"
              : order.paymentInfo.status === "Cash on Delivery"
                ? "COD"
                : "NOT PAID"}
          </p>
          <p>
            <strong>Amount:</strong> ${order.totalPrice.toFixed(2)}
          </p>
        </div>

        <div className="order-section">
          <h2>Status</h2>
          <span className={`status-badge ${(order.orderStatus || "pending").toLowerCase()}`}>
            {order.orderStatus || "Pending"}
          </span>
        </div>

        <div className="order-section">
          <h2>Order Items</h2>
          {order.orderItems.map((item) => (
            <div key={item._id} className="confirm-item">
              <img src={item.image || "https://placehold.co/400x400/2d3436/dfe6e9/webp?text=No+Image"} alt={item.name} />
              <span>
                {item.name}
                {item.color && <small className="confirm-item-size"> (Color: {item.color})</small>}
                {item.size && <small className="confirm-item-size"> (Size: {item.size})</small>}
              </span>
              <span>
                {item.quantity} x ${item.price} = $
                {(item.quantity * item.price).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
