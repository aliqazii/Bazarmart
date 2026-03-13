import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaTrash, FaUserShield, FaUser } from "react-icons/fa";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get("/api/v1/users/admin/users");
      setUsers(data.users);
    } catch {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (id, newRole) => {
    try {
      await axios.put(`/api/v1/users/admin/user/${id}`, { role: newRole });
      toast.success(`User role updated to ${newRole}`);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Role update failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user permanently?")) return;
    try {
      await axios.delete(`/api/v1/users/admin/user/${id}`);
      toast.success("User deleted");
      setUsers(users.filter((u) => u._id !== id));
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed");
    }
  };

  const admins = users.filter((u) => u.role === "admin");
  const regularUsers = users.filter((u) => u.role === "user");

  return (
    <div className="admin-content">
      <div className="admin-page-title">
        <h1>Users</h1>
      </div>

      {/* Summary */}
      <div className="user-summary">
        <div className="user-summary-card">
          <FaUserShield />
          <span>{admins.length} Admins</span>
        </div>
        <div className="user-summary-card">
          <FaUser />
          <span>{regularUsers.length} Users</span>
        </div>
      </div>

      {loading ? (
        <div className="admin-loader">Loading...</div>
      ) : users.length === 0 ? (
        <div className="admin-empty">No users found</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td className="id-cell">#{user._id.slice(-6)}</td>
                  <td>
                    <div className="user-name-cell">
                      <div className="user-avatar">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      {user.name}
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`badge ${user.role === "admin" ? "badge-admin" : "badge-user"}`}>
                      {user.role === "admin" ? <><FaUserShield /> Admin</> : <><FaUser /> User</>}
                    </span>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="table-actions">
                      {user.role === "user" ? (
                        <button
                          className="action-btn promote"
                          onClick={() => handleRoleChange(user._id, "admin")}
                          title="Promote to Admin"
                        >
                          <FaUserShield />
                        </button>
                      ) : (
                        <button
                          className="action-btn demote"
                          onClick={() => handleRoleChange(user._id, "user")}
                          title="Demote to User"
                        >
                          <FaUser />
                        </button>
                      )}
                      <button
                        className="action-btn delete"
                        onClick={() => handleDelete(user._id)}
                        title="Delete user"
                      >
                        <FaTrash />
                      </button>
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

export default AdminUsers;
