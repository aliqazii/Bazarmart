import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    loadUser();
  }, []);

  // Force light theme across the app.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "light");
    localStorage.removeItem("darkMode");
  }, []);

  // Load wishlist when user logs in
  useEffect(() => {
    if (user) {
      axios
        .get("/api/v1/wishlist")
        .then(({ data }) => setWishlist(data.products.map((p) => p._id)))
        .catch(() => setWishlist([]));
    } else {
      setWishlist([]);
    }
  }, [user]);

  const toggleWishlistItem = async (productId) => {
    try {
      const { data } = await axios.post("/api/v1/wishlist/toggle", { productId });
      if (data.added) {
        setWishlist((prev) => [...prev, productId]);
      } else {
        setWishlist((prev) => prev.filter((id) => id !== productId));
      }
      return data;
    } catch {
      return null;
    }
  };

  const loadUser = async () => {
    try {
      const { data } = await axios.get("/api/v1/users/me");
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const { data } = await axios.post("/api/v1/users/login", {
      email,
      password,
    });
    setUser(data.user);
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await axios.post("/api/v1/users/register", {
      name,
      email,
      password,
    });
    setUser(data.user);
    return data;
  };

  const googleLogin = async (credential) => {
    const { data } = await axios.post("/api/v1/users/google", {
      credential,
    });
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    await axios.get("/api/v1/users/logout");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        googleLogin,
        logout,
        wishlist,
        toggleWishlistItem,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
