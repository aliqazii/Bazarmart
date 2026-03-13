import { Fragment, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaTrash, FaTruck, FaCheckCircle, FaEye, FaFileExport } from "react-icons/fa";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get("/api/v1/orders/admin/all");
      setOrders(data.orders);
    } catch {
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await axios.put(`/api/v1/orders/admin/${id}`, { status });
      toast.success(`Order marked as ${status}`);
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this order permanently?")) return;
    try {
      await axios.delete(`/api/v1/orders/admin/${id}`);
      toast.success("Order deleted");
      setOrders(orders.filter((o) => o._id !== id));
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed");
    }
  };

  const filtered = filter ? orders.filter((o) => o.orderStatus === filter) : orders;

  const counts = {
    all: orders.length,
    Processing: orders.filter((o) => o.orderStatus === "Processing").length,
    Shipped: orders.filter((o) => o.orderStatus === "Shipped").length,
    Delivered: orders.filter((o) => o.orderStatus === "Delivered").length,
  };

  const handleExportCSV = async () => {
    try {
      const { data } = await axios.get("/api/v1/orders/admin/export/csv", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "orders.csv";
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("CSV exported!");
    } catch {
      toast.error("Export failed");
    }
  };

  return (
    <div className="admin-content">
      <div className="admin-page-title">
        <h1>Orders</h1>
        <button className="export-csv-btn" onClick={handleExportCSV}>
          <FaFileExport /> Export CSV
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="admin-tabs">
        <button className={`tab ${!filter ? "active" : ""}`} onClick={() => setFilter("")}>
          All ({counts.all})
        </button>
        <button className={`tab ${filter === "Processing" ? "active" : ""}`} onClick={() => setFilter("Processing")}>
          Processing ({counts.Processing})
        </button>
        <button className={`tab ${filter === "Shipped" ? "active" : ""}`} onClick={() => setFilter("Shipped")}>
          Shipped ({counts.Shipped})
        </button>
        <button className={`tab ${filter === "Delivered" ? "active" : ""}`} onClick={() => setFilter("Delivered")}>
          Delivered ({counts.Delivered})
        </button>
      </div>

      {loading ? (
        <div className="admin-loader">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="admin-empty">No orders found</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <Fragment key={order._id}>
                  <tr>
                    <td className="id-cell">#{order._id.slice(-6)}</td>
                    <td>{order.user?.name || "N/A"}</td>
                    <td>{order.orderItems.length}</td>
                    <td><strong>${order.totalPrice.toFixed(2)}</strong></td>
                    <td>
                      <span className={`badge ${order.paymentInfo?.status === "Cash on Delivery" ? "badge-warning" : "badge-success"}`}>
                        {order.paymentInfo?.status === "Cash on Delivery" ? "COD" : "Paid"}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${(order.orderStatus || "pending").toLowerCase()}`}>
                        {order.orderStatus || "Pending"}
                      </span>
                    </td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="action-btn view"
                          onClick={() => setExpandedId(expandedId === order._id ? null : order._id)}
                          title="View details"
                        >
                          <FaEye />
                        </button>
                        {order.orderStatus === "Processing" && (
                          <button
                            className="action-btn ship"
                            onClick={() => handleUpdateStatus(order._id, "Shipped")}
                            title="Mark as Shipped"
                          >
                            <FaTruck />
                          </button>
                        )}
                        {order.orderStatus === "Shipped" && (
                          <button
                            className="action-btn deliver"
                            onClick={() => handleUpdateStatus(order._id, "Delivered")}
                            title="Mark as Delivered"
                          >
                            <FaCheckCircle />
                          </button>
                        )}
                        <button
                          className="action-btn delete"
                          onClick={() => handleDelete(order._id)}
                          title="Delete order"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedId === order._id && (
                    <tr className="order-detail-row">
                      <td colSpan="8">
                        <div className="order-expand">
                          <div className="order-expand-section">
                            <h4>Shipping Info</h4>
                            <p>{order.shippingInfo?.address}, {order.shippingInfo?.city}, {order.shippingInfo?.state}</p>
                            <p>Phone: {order.shippingInfo?.phoneNo}</p>
                          </div>
                          <div className="order-expand-section">
                            <h4>Items</h4>
                            {order.orderItems.map((item, i) => (
                              <div key={i} className="expand-item">
                                <span>{item.name}</span>
                                <span>{item.quantity} x ${item.price.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                          <div className="order-expand-section">
                            <h4>Price Breakdown</h4>
                            <p>Items: ${order.itemsPrice?.toFixed(2)}</p>
                            <p>Shipping: ${order.shippingPrice?.toFixed(2)}</p>
                            <p>Tax: ${order.taxPrice?.toFixed(2)}</p>
                            <p><strong>Total: ${order.totalPrice.toFixed(2)}</strong></p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
