import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const Tracking = () => {
  const { id } = useParams();
  const [tracking, setTracking] = useState(null);

  useEffect(() => {
    axios.get(`/api/v1/innovation/tracking/${id}`)
      .then((res) => setTracking(res.data.tracking))
      .catch(() => toast.error("Failed to load tracking"));
  }, [id]);

  if (!tracking) return <div className="loader">Loading...</div>;

  return (
    <div className="order-detail-page">
      <h1>Tracking #{tracking.orderId.slice(-8)}</h1>
      <p><strong>Courier:</strong> {tracking.courier}</p>
      <p><strong>Tracking #:</strong> {tracking.trackingNumber}</p>
      <div className="activity-log-list">
        {tracking.timeline.map((step, idx) => (
          <div key={idx} className="activity-log-item">
            <div className="activity-log-header">
              <span className="badge badge-success">{step.status}</span>
              <span className="activity-log-time">{new Date(step.at).toLocaleString()}</span>
            </div>
            <p className="activity-log-details">{step.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tracking;
