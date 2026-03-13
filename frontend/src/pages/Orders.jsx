import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await axios.get("/api/v1/orders/me");
        setOrders(data.orders);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <div className="loader">Loading...</div>;

  return (
    <div className="orders-page">
      <h1>My Orders</h1>

      {orders.length === 0 ? (
        <div className="empty-cart">
          <h2>No orders yet</h2>
          <Link to="/products">
            <button>Start Shopping</button>
          </Link>
        </div>
      ) : (
        <div className="orders-table">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Status</th>
                <th>Items</th>
                <th>Total</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>{order._id}</td>
                  <td>
                    <span
                      className={`status-badge ${(order.orderStatus || "pending").toLowerCase()}`}
                    >
                      {order.orderStatus || "Pending"}
                    </span>
                  </td>
                  <td>{order.orderItems.length}</td>
                  <td>${order.totalPrice.toFixed(2)}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>
                    <Link to={`/order/${order._id}`} className="view-link">
                      View
                    </Link>
                    {" | "}
                    <Link to={`/tracking/${order._id}`} className="view-link">
                      Track
                    </Link>
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

export default Orders;
