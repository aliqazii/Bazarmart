import { NavLink, Outlet } from "react-router-dom";
import {
  FaTachometerAlt,
  FaBox,
  FaShoppingCart,
  FaUsers,
  FaPlusCircle,
  FaArrowLeft,
  FaTag,
  FaHistory,
  FaChartLine,
  FaUndoAlt,
  FaTruck,
} from "react-icons/fa";

const AdminLayout = () => {
  const navClassName = ({ isActive }) => (isActive ? "active" : "");

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <div className="admin-brand">
            <NavLink to="/" className="admin-back-link" title="Back to Store">
              <FaArrowLeft />
            </NavLink>
            <h2>Bazarmart</h2>
          </div>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/admin/dashboard" end className={navClassName}>
            <FaTachometerAlt /> <span>Dashboard</span>
          </NavLink>
          <NavLink to="/admin/products" className={navClassName}>
            <FaBox /> <span>Products</span>
          </NavLink>
          <NavLink to="/admin/product/new" className={navClassName}>
            <FaPlusCircle /> <span>Add Product</span>
          </NavLink>
          <NavLink to="/admin/orders" className={navClassName}>
            <FaShoppingCart /> <span>Orders</span>
          </NavLink>
          <NavLink to="/admin/users" className={navClassName}>
            <FaUsers /> <span>Users</span>
          </NavLink>
          <NavLink to="/admin/coupons" className={navClassName}>
            <FaTag /> <span>Coupons</span>
          </NavLink>
          <NavLink to="/admin/activity-log" className={navClassName}>
            <FaHistory /> <span>Activity Log</span>
          </NavLink>
          <NavLink to="/admin/returns" className={navClassName}>
            <FaUndoAlt /> <span>Returns</span>
          </NavLink>
          <NavLink to="/admin/tracking" className={navClassName}>
            <FaTruck /> <span>Tracking</span>
          </NavLink>
          <NavLink to="/admin/analytics" className={navClassName}>
            <FaChartLine /> <span>Analytics</span>
          </NavLink>
        </nav>
      </aside>
      <div className="admin-main">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
