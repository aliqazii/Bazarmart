import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FaBox,
  FaUsers,
  FaShoppingCart,
  FaDollarSign,
  FaExclamationTriangle,
  FaTruck,
  FaCheckCircle,
  FaClock,
} from "react-icons/fa";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

const COLORS = ["#6c5ce7", "#00b894", "#fdcb6e", "#e17055", "#0984e3", "#d63031", "#00cec9"];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revenueByMonth, setRevenueByMonth] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const didFetchRef = useRef(false);

  useEffect(() => {
    if (didFetchRef.current) return;
    didFetchRef.current = true;

    const fetchData = async () => {
      try {
        const [productSummaryRes, usersRes, ordersRes] = await Promise.all([
          axios.get("/api/v1/products/admin/summary"),
          axios.get("/api/v1/users/admin/users"),
          axios.get("/api/v1/orders/admin/all"),
        ]);

        const orders = Array.isArray(ordersRes.data?.orders) ? ordersRes.data.orders : [];
        const users = Array.isArray(usersRes.data?.users) ? usersRes.data.users : [];
        const productsCount = Number(productSummaryRes.data?.productsCount || 0);

        const processing = orders.filter((o) => o.orderStatus === "Processing").length;
        const shipped = orders.filter((o) => o.orderStatus === "Shipped").length;
        const delivered = orders.filter((o) => o.orderStatus === "Delivered").length;

        setStats({
          products: productsCount,
          users: users.length,
          orders: orders.length,
          totalRevenue: ordersRes.data.totalAmount || 0,
          processing,
          shipped,
          delivered,
        });

        setRecentOrders(orders.slice(0, 8));

        // Revenue by month chart
        const monthMap = {};
        orders.forEach((o) => {
          const d = new Date(o.createdAt);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
          monthMap[key] = (monthMap[key] || 0) + o.totalPrice;
        });
        const sortedMonths = Object.keys(monthMap).sort();
        setRevenueByMonth(
          sortedMonths.map((m) => ({
            month: m,
            revenue: Math.round(monthMap[m] * 100) / 100,
          }))
        );

        setLowStock(Array.isArray(productSummaryRes.data?.lowStockProducts) ? productSummaryRes.data.lowStockProducts : []);
        setCategoryData(
          Array.isArray(productSummaryRes.data?.productsByCategory)
            ? productSummaryRes.data.productsByCategory
            : []
        );
      } catch (error) {
        const status = error?.response?.status;
        const apiMessage = error?.response?.data?.message;

        let message = apiMessage || "Failed to load dashboard data";
        if (status === 401) message = "Session expired. Please login again.";
        else if (status === 403) message = "Admin access required.";
        else if (status === 429) message = "Too many requests. Please wait a moment and refresh.";
        else if (error?.code === "ERR_NETWORK") {
          message = "Cannot reach API server. Start the backend on http://localhost:5000.";
        }

        toast.error(message, { id: "admin-dashboard-load" });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="admin-loader">Loading dashboard...</div>;
  if (!stats) return null;

  return (
    <div className="admin-dashboard">
      <div className="admin-page-title">
        <h1>Dashboard</h1>
        <p>Welcome back, Admin</p>
      </div>

      {/* Revenue Banner */}
      <div className="revenue-banner">
        <FaDollarSign />
        <div>
          <span className="revenue-label">Total Revenue</span>
          <span className="revenue-value">${stats.totalRevenue.toFixed(2)}</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        <Link to="/admin/products" className="stat-card stat-products">
          <div className="stat-icon-wrap"><FaBox /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.products}</span>
            <span className="stat-label">Products</span>
          </div>
        </Link>
        <Link to="/admin/orders" className="stat-card stat-orders">
          <div className="stat-icon-wrap"><FaShoppingCart /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.orders}</span>
            <span className="stat-label">Total Orders</span>
          </div>
        </Link>
        <Link to="/admin/users" className="stat-card stat-users">
          <div className="stat-icon-wrap"><FaUsers /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.users}</span>
            <span className="stat-label">Users</span>
          </div>
        </Link>
      </div>

      {/* Order Status Cards */}
      <div className="order-status-grid">
        <div className="order-status-card processing">
          <FaClock />
          <span className="os-count">{stats.processing}</span>
          <span className="os-label">Processing</span>
        </div>
        <div className="order-status-card shipped">
          <FaTruck />
          <span className="os-count">{stats.shipped}</span>
          <span className="os-label">Shipped</span>
        </div>
        <div className="order-status-card delivered">
          <FaCheckCircle />
          <span className="os-count">{stats.delivered}</span>
          <span className="os-label">Delivered</span>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        {revenueByMonth.length > 0 && (
          <div className="chart-card">
            <h2>Revenue Over Time</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(v) => `$${v.toFixed(2)}`} />
                <Bar dataKey="revenue" fill="#6c5ce7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        {categoryData.length > 0 && (
          <div className="chart-card">
            <h2>Products by Category</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" outerRadius={100} label dataKey="value">
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="dashboard-bottom">
        {/* Recent Orders */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Orders</h2>
            <Link to="/admin/orders" className="view-all-link">View All</Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="empty-text">No orders yet</p>
          ) : (
            <div className="mini-table-wrap">
              <table className="mini-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order._id}>
                      <td className="id-cell">#{order._id.slice(-6)}</td>
                      <td>{order.user?.name || "N/A"}</td>
                      <td>${order.totalPrice.toFixed(2)}</td>
                      <td>
                        <span className={`badge badge-${order.orderStatus.toLowerCase()}`}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low Stock Alert */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2><FaExclamationTriangle style={{ color: "#f0ad4e" }} /> Low Stock Alert</h2>
          </div>
          {lowStock.length === 0 ? (
            <p className="empty-text">All products are well-stocked</p>
          ) : (
            <div className="low-stock-list">
              {lowStock.map((p) => (
                <Link to={`/admin/product/${p._id}`} key={p._id} className="low-stock-item">
                  <img src={p.images?.[0]?.url || "https://placehold.co/400x400/2d3436/dfe6e9/webp?text=No+Image"} alt={p.name} />
                  <div className="low-stock-info">
                    <span className="low-stock-name">{p.name}</span>
                    <span className="low-stock-qty">{p.stock} left</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
