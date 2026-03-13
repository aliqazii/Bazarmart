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
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/admin/dashboard" end>
            <FaTachometerAlt /> Dashboard
          </NavLink>
          <NavLink to="/admin/products">
            <FaBox /> Products
          </NavLink>
          <NavLink to="/admin/product/new">
            <FaPlusCircle /> Add Product
          </NavLink>
          <NavLink to="/admin/orders">
            <FaShoppingCart /> Orders
          </NavLink>
          <NavLink to="/admin/users">
            <FaUsers /> Users
          </NavLink>
          <NavLink to="/admin/coupons">
            <FaTag /> Coupons
          </NavLink>
          <NavLink to="/admin/activity-log">
            <FaHistory /> Activity Log
          </NavLink>
          <NavLink to="/admin/returns">
            <FaUndoAlt /> Returns
          </NavLink>
          <NavLink to="/admin/tracking">
            <FaTruck /> Tracking
          </NavLink>
          <NavLink to="/admin/analytics">
            <FaChartLine /> Analytics
          </NavLink>
        </nav>
        <div className="sidebar-footer">
          <NavLink to="/" className="back-to-store">
            <FaArrowLeft /> Back to Store
          </NavLink>
        </div>
      </aside>
      <div className="admin-main">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
