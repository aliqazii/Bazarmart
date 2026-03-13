import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const AdminActivityLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const { data } = await axios.get("/api/v1/activity-logs");
        setLogs(data.logs || []);
      } catch {
        toast.error("Failed to fetch activity logs");
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const getActionColor = (action) => {
    if (action.includes("CREATE")) return "badge-success";
    if (action.includes("DELETE")) return "badge-danger";
    return "badge-warning";
  };

  return (
    <div className="admin-content">
      <div className="admin-page-title">
        <h1>Activity Log</h1>
        <p>Recent admin activities</p>
      </div>

      {loading ? (
        <div className="admin-loader">Loading...</div>
      ) : logs.length === 0 ? (
        <div className="admin-empty">No activity recorded yet</div>
      ) : (
        <div className="activity-log-list">
          {logs.map((log) => (
            <div key={log._id} className="activity-log-item">
              <div className="activity-log-header">
                <span className={`badge ${getActionColor(log.action)}`}>
                  {log.action.replace(/_/g, " ")}
                </span>
                <span className="activity-log-time">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="activity-log-body">
                <span className="activity-log-user">
                  {log.user?.name || "System"} ({log.user?.email || ""})
                </span>
                {log.entityType && (
                  <span className="activity-log-entity">
                    {log.entityType}: {log.entityId?.toString().slice(-6)}
                  </span>
                )}
                {log.details && <p className="activity-log-details">{log.details}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminActivityLog;
