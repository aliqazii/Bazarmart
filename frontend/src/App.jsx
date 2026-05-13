import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/AdminLayout";
import ScrollToTop from "./components/ScrollToTop";
import SeoManager from "./components/SeoManager";
import { AuthProvider } from "./context/AuthContext";

const Home = lazy(() => import("./pages/Home"));
const Products = lazy(() => import("./pages/Products"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Cart = lazy(() => import("./pages/Cart"));
const Profile = lazy(() => import("./pages/Profile"));
const Shipping = lazy(() => import("./pages/Shipping"));
const ConfirmOrder = lazy(() => import("./pages/ConfirmOrder"));
const Payment = lazy(() => import("./pages/Payment"));
const Orders = lazy(() => import("./pages/Orders"));
const OrderDetail = lazy(() => import("./pages/OrderDetail"));
const Tracking = lazy(() => import("./pages/Tracking"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const Compare = lazy(() => import("./pages/Compare"));
const Returns = lazy(() => import("./pages/Returns"));
const Rewards = lazy(() => import("./pages/Rewards"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminProductForm = lazy(() => import("./pages/admin/AdminProductForm"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminCoupons = lazy(() => import("./pages/admin/AdminCoupons"));
const AdminActivityLog = lazy(() => import("./pages/admin/AdminActivityLog"));
const AdminReturns = lazy(() => import("./pages/admin/AdminReturns"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminTracking = lazy(() => import("./pages/admin/AdminTracking"));
const Contact = lazy(() => import("./pages/Contact"));
const ShippingPolicy = lazy(() => import("./pages/ShippingPolicy"));
const ReturnPolicy = lazy(() => import("./pages/ReturnPolicy"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ChatBot = lazy(() => import("./components/ChatBot"));

const RouteLoader = () => (
  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "var(--page-bg)", width: "100%" }}>
    <div style={{ 
      width: "40px", 
      height: "40px", 
      border: "3px solid rgba(16, 185, 129, 0.15)", 
      borderTopColor: "var(--brand-accent)", 
      borderRadius: "50%", 
      animation: "spin 1s linear infinite" 
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

const StoreLayout = () => (
  <>
    <Header />
    <main className="main-content">
      <Suspense fallback={<RouteLoader />}>
        <Outlet />
      </Suspense>
    </main>
    <Footer />
  </>
);

const AdminLayoutWrapper = () => (
  <ProtectedRoute adminOnly>
    <Suspense fallback={<RouteLoader />}>
      <Outlet />
    </Suspense>
  </ProtectedRoute>
);

function AppRoutes() {
  return (
    <Routes>
      <Route element={<StoreLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/shipping-policy" element={<ShippingPolicy />} />
        <Route path="/return-policy" element={<ReturnPolicy />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="*" element={<NotFound />} />

        {/* Protected Store Routes */}
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/shipping" element={<ProtectedRoute><Shipping /></ProtectedRoute>} />
        <Route path="/order/confirm" element={<ProtectedRoute><ConfirmOrder /></ProtectedRoute>} />
        <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        <Route path="/order/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
        <Route path="/tracking/:id" element={<ProtectedRoute><Tracking /></ProtectedRoute>} />
        <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
        <Route path="/returns" element={<ProtectedRoute><Returns /></ProtectedRoute>} />
        <Route path="/rewards" element={<ProtectedRoute><Rewards /></ProtectedRoute>} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminLayoutWrapper />}>
        <Route element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="product/new" element={<AdminProductForm />} />
          <Route path="product/:id" element={<AdminProductForm />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="activity-log" element={<AdminActivityLog />} />
          <Route path="returns" element={<AdminReturns />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="tracking" element={<AdminTracking />} />
        </Route>
      </Route>
    </Routes>
  );
}

// Extracted outside App to avoid re-creation on every render
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const Providers = ({ children }) =>
  googleClientId ? (
    <GoogleOAuthProvider clientId={googleClientId}>{children}</GoogleOAuthProvider>
  ) : (
    <>{children}</>
  );

function App() {
  return (
    <AuthProvider>
      <Providers>
        <Router>
          <ScrollToTop />
          <SeoManager />
          <AppRoutes />
          <Toaster position="bottom-center" />
          <Suspense fallback={null}>
            <ChatBot />
          </Suspense>
        </Router>
      </Providers>
    </AuthProvider>
  );
}

export default App;
