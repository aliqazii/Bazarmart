import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const AdminReturns = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");

  const load = async () => {
    try {
      const { data } = await axios.get("/api/v1/innovation/returns/admin");
      setRequests(data.requests || []);
    } catch {
      toast.error("Failed to load return requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const counts = {
    all: requests.length,
    Requested: requests.filter((r) => r.status === "Requested").length,
    Approved: requests.filter((r) => r.status === "Approved").length,
    Rejected: requests.filter((r) => r.status === "Rejected").length,
    Refunded: requests.filter((r) => r.status === "Refunded").length,
  };

  const filteredRequests = requests.filter((r) => {
    const matchesFilter = filter === "all" ? true : r.status === filter;
    const matchesQuery = query.trim()
      ? `${r.order?._id || ""} ${r.user?.name || ""} ${r.reason || ""}`
          .toLowerCase()
          .includes(query.toLowerCase())
      : true;
    return matchesFilter && matchesQuery;
  });

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`/api/v1/innovation/returns/${id}/admin`, { status });
      toast.success("Return status updated");
      load();
    } catch {
      toast.error("Failed to update return");
    }
  };

  if (loading) return <div className="admin-loader">Loading...</div>;

  return (
    <div className="admin-content">
      <div className="admin-page-title">
        <h1>Return Requests</h1>
        <p>Review customer requests and update refund statuses</p>
      </div>

      <div className="admin-tools-row">
        <div className="admin-tabs">
          <button className={`tab ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>
            All ({counts.all})
          </button>
          <button className={`tab ${filter === "Requested" ? "active" : ""}`} onClick={() => setFilter("Requested")}>
            Requested ({counts.Requested})
          </button>
          <button className={`tab ${filter === "Approved" ? "active" : ""}`} onClick={() => setFilter("Approved")}>
            Approved ({counts.Approved})
          </button>
          <button className={`tab ${filter === "Refunded" ? "active" : ""}`} onClick={() => setFilter("Refunded")}>
            Refunded ({counts.Refunded})
          </button>
        </div>
        <input
          className="admin-search-input"
          placeholder="Search by order, customer, reason"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {filteredRequests.length === 0 ? (
        <div className="admin-empty">No return requests found for this filter.</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((r) => (
                <tr key={r._id}>
                  <td>#{r.order?._id?.slice(-6)}</td>
                  <td>{r.user?.name || "N/A"}</td>
                  <td>{r.reason}</td>
                  <td>
                    <span className={`badge ${r.status === "Requested" ? "badge-warning" : r.status === "Refunded" ? "badge-success" : "badge-danger"}`}>
                      {r.status}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="action-btn deliver" disabled={r.status === "Approved" || r.status === "Refunded"} onClick={() => updateStatus(r._id, "Approved")}>Approve</button>
                      <button className="action-btn delete" disabled={r.status === "Rejected" || r.status === "Refunded"} onClick={() => updateStatus(r._id, "Rejected")}>Reject</button>
                      <button className="action-btn ship" disabled={r.status === "Refunded"} onClick={() => updateStatus(r._id, "Refunded")}>Refunded</button>
                    </div>
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

export default AdminReturns;
