import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { GoogleLogin } from "@react-oauth/google";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, googleLogin, loading } = useAuth();
  const navigate = useNavigate();

  const googleEnabled = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success("Logged in successfully");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1>Login</h1>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        {googleEnabled && (
          <div className="google-auth-wrap">
            <GoogleLogin
              onSuccess={async (cred) => {
                try {
                  await googleLogin(cred.credential);
                  toast.success("Logged in with Google");
                  navigate("/");
                } catch (error) {
                  toast.error(error.response?.data?.message || "Google login failed");
                }
              }}
              onError={() => toast.error("Google login failed")}
            />
          </div>
        )}

        <p className="auth-link">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
