import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { FaTrash, FaPlus, FaUserCircle } from "react-icons/fa";

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: "",
    address: "",
    city: "",
    state: "",
    country: "Pakistan",
    pinCode: "",
    phoneNo: "",
  });

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const { data } = await axios.get("/api/v1/users/me/addresses");
        setAddresses(data.addresses || []);
      } catch { /* ignore */ }
    };
    if (user) fetchAddresses();
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch {
      toast.error("Logout failed");
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post("/api/v1/users/me/addresses", newAddress);
      setAddresses(data.addresses || []);
      setShowAddForm(false);
      setNewAddress({ label: "", address: "", city: "", state: "", country: "Pakistan", pinCode: "", phoneNo: "" });
      toast.success("Address added!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add address");
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      const { data } = await axios.delete(`/api/v1/users/me/addresses/${addressId}`);
      setAddresses(data.addresses || []);
      toast.success("Address removed");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete address");
    }
  };

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="profile-page">
      <h1>My Profile</h1>

      <div className="profile-content">
        <div className="profile-hero">
          <FaUserCircle />
          <div>
            <strong>{user.name}</strong>
            <span>{user.role === "admin" ? "Administrator Account" : "Customer Account"}</span>
          </div>
        </div>

        <div className="profile-info">
          <h3>Account Details</h3>
          <div className="profile-fields-grid">
            <div className="profile-field">
              <label>Name</label>
              <p>{user.name}</p>
            </div>
            <div className="profile-field">
              <label>Email</label>
              <p>{user.email}</p>
            </div>
            <div className="profile-field">
              <label>Joined On</label>
              <p>{new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="profile-actions">
            <button className="profile-action-btn secondary" onClick={() => navigate("/rewards")}>Rewards</button>
            <button className="profile-action-btn primary" onClick={() => navigate("/returns")}>Returns & Refunds</button>
            <button className="profile-action-btn danger" onClick={handleLogout}>Logout</button>
          </div>
        </div>

        {/* Address Book */}
        <div className="address-book">
          <div className="address-book-header">
            <h2>Address Book</h2>
            <button className="add-address-btn" onClick={() => setShowAddForm(!showAddForm)}>
              <FaPlus /> Add Address
            </button>
          </div>

          {showAddForm && (
            <form className="address-form" onSubmit={handleAddAddress}>
              <div className="form-group">
                <label>Label (e.g. Home, Work)</label>
                <input type="text" value={newAddress.label} onChange={(e) => setNewAddress((p) => ({ ...p, label: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input type="text" value={newAddress.address} onChange={(e) => setNewAddress((p) => ({ ...p, address: e.target.value }))} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input type="text" value={newAddress.city} onChange={(e) => setNewAddress((p) => ({ ...p, city: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label>State/Province</label>
                  <input type="text" value={newAddress.state} onChange={(e) => setNewAddress((p) => ({ ...p, state: e.target.value }))} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Postal Code</label>
                  <input type="text" value={newAddress.pinCode} onChange={(e) => setNewAddress((p) => ({ ...p, pinCode: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input type="text" value={newAddress.phoneNo} onChange={(e) => setNewAddress((p) => ({ ...p, phoneNo: e.target.value }))} required />
                </div>
              </div>
              <div className="address-form-actions">
                <button type="submit">Save Address</button>
                <button type="button" onClick={() => setShowAddForm(false)}>Cancel</button>
              </div>
            </form>
          )}

          {addresses.length === 0 ? (
            <p className="no-addresses">No saved addresses yet</p>
          ) : (
            <div className="address-list">
              {addresses.map((addr) => (
                <div key={addr._id} className="address-card">
                  <div className="address-card-info">
                    <strong>{addr.label || "Address"}</strong>
                    <p>{addr.address}</p>
                    <p>{addr.city}, {addr.state} {addr.pinCode}</p>
                    <p>{addr.phoneNo}</p>
                  </div>
                  <button className="delete-address-btn" onClick={() => handleDeleteAddress(addr._id)}>
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
