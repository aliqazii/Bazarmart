import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const AdminAnalytics = () => {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    axios
      .get("/api/v1/innovation/analytics/admin/overview")
      .then((res) => setMetrics(res.data.metrics))
      .catch(() => toast.error("Failed to load analytics"));
  }, []);

  if (!metrics) return <div className="admin-loader">Loading analytics...</div>;

  return (
    <div className="admin-content">
      <div className="admin-page-title">
        <h1>Business Analytics</h1>
        <p>Conversion, retention, and category performance</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-info"><span className="stat-value">{metrics.users}</span><span className="stat-label">Users</span></div></div>
        <div className="stat-card"><div className="stat-info"><span className="stat-value">{metrics.orders}</span><span className="stat-label">Orders</span></div></div>
        <div className="stat-card"><div className="stat-info"><span className="stat-value">${metrics.revenue.toFixed(2)}</span><span className="stat-label">Revenue</span></div></div>
        <div className="stat-card"><div className="stat-info"><span className="stat-value">{metrics.conversionRate}%</span><span className="stat-label">Conversion</span></div></div>
      </div>

      <div className="analytics-mini-grid">
        <div className="analytics-mini-card">
          <span>Delivered Orders</span>
          <strong>{metrics.delivered}</strong>
        </div>
        <div className="analytics-mini-card">
          <span>Repeat Customers</span>
          <strong>{metrics.repeatCustomers}</strong>
        </div>
        <div className="analytics-mini-card">
          <span>Total Products</span>
          <strong>{metrics.products}</strong>
        </div>
      </div>

      <div className="dashboard-section analytics-breakdown">
        <h2>Category Breakdown</h2>
        <div className="activity-log-list">
          {Object.entries(metrics.categories || {}).map(([name, value]) => (
            <div key={name} className="activity-log-item">
              <div className="activity-log-header">
                <span className="activity-log-user">{name}</span>
                <span className="badge badge-success">{value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
