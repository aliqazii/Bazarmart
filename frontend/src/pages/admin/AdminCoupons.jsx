import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaTrash, FaPlus } from "react-icons/fa";

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    code: "",
    discount: 10,
    minAmount: 0,
    maxUses: 100,
    expiresAt: "",
  });

  const fetchCoupons = async () => {
    try {
      const { data } = await axios.get("/api/v1/coupons");
      setCoupons(data.coupons || []);
    } catch {
      toast.error("Failed to fetch coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/v1/coupons", form);
      toast.success("Coupon created!");
      setShowForm(false);
      setForm({ code: "", discount: 10, minAmount: 0, maxUses: 100, expiresAt: "" });
      fetchCoupons();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create coupon");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this coupon?")) return;
    try {
      await axios.delete(`/api/v1/coupons/${id}`);
      toast.success("Coupon deleted");
      setCoupons(coupons.filter((c) => c._id !== id));
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="admin-content">
      <div className="admin-page-title">
        <h1>Coupons</h1>
        <button className="add-btn" onClick={() => setShowForm(!showForm)}>
          <FaPlus /> New Coupon
        </button>
      </div>

      {showForm && (
        <form className="coupon-form" onSubmit={handleCreate}>
          <div className="form-row">
            <div className="form-group">
              <label>Code</label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                placeholder="e.g. SAVE20"
                required
              />
            </div>
            <div className="form-group">
              <label>Discount %</label>
              <input
                type="number"
                min="1"
                max="100"
                value={form.discount}
                onChange={(e) => setForm((p) => ({ ...p, discount: Number(e.target.value) }))}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Min Order Amount ($)</label>
              <input
                type="number"
                min="0"
                value={form.minAmount}
                onChange={(e) => setForm((p) => ({ ...p, minAmount: Number(e.target.value) }))}
              />
            </div>
            <div className="form-group">
              <label>Max Uses</label>
              <input
                type="number"
                min="1"
                value={form.maxUses}
                onChange={(e) => setForm((p) => ({ ...p, maxUses: Number(e.target.value) }))}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Expiry Date</label>
            <input
              type="date"
              value={form.expiresAt}
              onChange={(e) => setForm((p) => ({ ...p, expiresAt: e.target.value }))}
              required
            />
          </div>
          <div className="form-actions">
            <button type="submit">Create Coupon</button>
            <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="admin-loader">Loading...</div>
      ) : coupons.length === 0 ? (
        <div className="admin-empty">No coupons yet</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount</th>
                <th>Min Amount</th>
                <th>Used / Max</th>
                <th>Expires</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c._id}>
                  <td><strong>{c.code}</strong></td>
                  <td>{c.discount}%</td>
                  <td>${c.minAmount}</td>
                  <td>{c.usedCount} / {c.maxUses}</td>
                  <td>{new Date(c.expiresAt).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge ${c.active && new Date(c.expiresAt) > new Date() ? "badge-success" : "badge-warning"}`}>
                      {c.active && new Date(c.expiresAt) > new Date() ? "Active" : "Expired"}
                    </span>
                  </td>
                  <td>
                    <button className="action-btn delete" onClick={() => handleDelete(c._id)}>
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminCoupons;
