import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const Returns = () => {
  const [requests, setRequests] = useState([]);
  const [orderId, setOrderId] = useState("");
  const [reason, setReason] = useState("");

  const load = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/v1/innovation/returns/me");
      setRequests(data.requests || []);
    } catch {
      toast.error("Failed to load return requests");
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      load();
    }, 0);
    return () => clearTimeout(timer);
  }, [load]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/v1/innovation/returns", { orderId, reason });
      toast.success("Return request submitted");
      setOrderId("");
      setReason("");
      load();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit");
    }
  };

  return (
    <div className="profile-page">
      <h1>Returns & Refunds</h1>
      <form className="address-form" onSubmit={submit}>
        <div className="form-group">
          <label>Order ID</label>
          <input value={orderId} onChange={(e) => setOrderId(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Reason</label>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} required />
        </div>
        <button type="submit">Submit Return Request</button>
      </form>

      <div className="orders-table">
        <table>
          <thead>
            <tr><th>Order</th><th>Status</th><th>Reason</th><th>Date</th></tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r._id}>
                <td>{r.order?._id?.slice(-8)}</td>
                <td>{r.status}</td>
                <td>{r.reason}</td>
                <td>{new Date(r.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Returns;
