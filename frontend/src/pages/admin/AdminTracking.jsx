import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const AdminTracking = () => {
  const [orderId, setOrderId] = useState("");
  const [status, setStatus] = useState("Shipped");
  const [courier, setCourier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [note, setNote] = useState("");
  const [lastUpdate, setLastUpdate] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    try {
      await axios.put(`/api/v1/innovation/tracking/${orderId}/admin`, {
        status,
        courier,
        trackingNumber,
        note,
      });
      toast.success("Tracking updated");
      setLastUpdate({
        orderId,
        status,
        courier,
        trackingNumber,
        note,
        at: new Date().toLocaleString(),
      });
      setNote("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update tracking");
    }
  };

  return (
    <div className="admin-content">
      <div className="admin-page-title">
        <h1>Tracking Management</h1>
        <p>Update courier status and delivery timeline for customers</p>
      </div>
      <form className="coupon-form" onSubmit={submit}>
        <div className="form-group">
          <label>Order ID</label>
          <input value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder="Paste full order ID" required />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>
          <div className="form-group">
            <label>Courier</label>
            <input value={courier} onChange={(e) => setCourier(e.target.value)} placeholder="Leopard / TCS / DHL" />
          </div>
        </div>
        <div className="form-group">
          <label>Tracking Number</label>
          <input value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Note</label>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
        </div>
        <button type="submit">Update Tracking</button>
      </form>

      {lastUpdate && (
        <div className="dashboard-section tracking-last-update">
          <h2>Last Update</h2>
          <p><strong>Order:</strong> {lastUpdate.orderId}</p>
          <p><strong>Status:</strong> {lastUpdate.status}</p>
          <p><strong>Courier:</strong> {lastUpdate.courier || "N/A"}</p>
          <p><strong>Tracking #:</strong> {lastUpdate.trackingNumber || "N/A"}</p>
          <p><strong>Note:</strong> {lastUpdate.note || "-"}</p>
          <p><strong>Updated At:</strong> {lastUpdate.at}</p>
        </div>
      )}
    </div>
  );
};

export default AdminTracking;
