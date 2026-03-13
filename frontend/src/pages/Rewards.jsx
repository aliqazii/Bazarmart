import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const Rewards = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get("/api/v1/innovation/loyalty/me")
      .then((res) => setData(res.data.loyalty))
      .catch(() => toast.error("Failed to load rewards"));
  }, []);

  if (!data) return <div className="loader">Loading...</div>;

  return (
    <div className="profile-page">
      <h1>Loyalty & Rewards</h1>
      <div className="address-card">
        <div className="address-card-info">
          <strong>Tier: {data.tier}</strong>
          <p>Points: {data.points}</p>
          <p>Orders: {data.ordersCount}</p>
          <p>Referral Code: {data.referralCode || "N/A"}</p>
        </div>
      </div>
    </div>
  );
};

export default Rewards;
