import { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/AdminLayout";
import ScrollToTop from "./components/ScrollToTop";
import SeoManager from "./components/SeoManager";
import { AuthProvider } from "./context/AuthContext";
import "./App.css";

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

const RouteLoader = () => <div className="loader">Loading...</div>;

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <SeoManager />
        <Suspense fallback={<RouteLoader />}>
          <Routes>
            {/* Store Routes - with Header/Footer */}
            <Route path="/" element={<><Header /><main className="main-content"><Home /></main><Footer /></>} />
            <Route path="/products" element={<><Header /><main className="main-content"><Products /></main><Footer /></>} />
            <Route path="/product/:id" element={<><Header /><main className="main-content"><ProductDetail /></main><Footer /></>} />
            <Route path="/login" element={<><Header /><main className="main-content"><Login /></main><Footer /></>} />
            <Route path="/register" element={<><Header /><main className="main-content"><Register /></main><Footer /></>} />
            <Route path="/cart" element={<><Header /><main className="main-content"><Cart /></main><Footer /></>} />
            <Route path="/contact" element={<><Header /><main className="main-content"><Contact /></main><Footer /></>} />
            <Route path="/shipping-policy" element={<><Header /><main className="main-content"><ShippingPolicy /></main><Footer /></>} />
            <Route path="/return-policy" element={<><Header /><main className="main-content"><ReturnPolicy /></main><Footer /></>} />
            <Route path="/privacy-policy" element={<><Header /><main className="main-content"><PrivacyPolicy /></main><Footer /></>} />
            <Route path="/terms-of-service" element={<><Header /><main className="main-content"><TermsOfService /></main><Footer /></>} />

            {/* Protected Routes */}
            <Route path="/profile" element={<><Header /><main className="main-content"><ProtectedRoute><Profile /></ProtectedRoute></main><Footer /></>} />
            <Route path="/shipping" element={<><Header /><main className="main-content"><ProtectedRoute><Shipping /></ProtectedRoute></main><Footer /></>} />
            <Route path="/order/confirm" element={<><Header /><main className="main-content"><ProtectedRoute><ConfirmOrder /></ProtectedRoute></main><Footer /></>} />
            <Route path="/payment" element={<><Header /><main className="main-content"><ProtectedRoute><Payment /></ProtectedRoute></main><Footer /></>} />
            <Route path="/orders" element={<><Header /><main className="main-content"><ProtectedRoute><Orders /></ProtectedRoute></main><Footer /></>} />
            <Route path="/order/:id" element={<><Header /><main className="main-content"><ProtectedRoute><OrderDetail /></ProtectedRoute></main><Footer /></>} />
            <Route path="/tracking/:id" element={<><Header /><main className="main-content"><ProtectedRoute><Tracking /></ProtectedRoute></main><Footer /></>} />
            <Route path="/wishlist" element={<><Header /><main className="main-content"><ProtectedRoute><Wishlist /></ProtectedRoute></main><Footer /></>} />
            <Route path="/compare" element={<><Header /><main className="main-content"><Compare /></main><Footer /></>} />
            <Route path="/returns" element={<><Header /><main className="main-content"><ProtectedRoute><Returns /></ProtectedRoute></main><Footer /></>} />
            <Route path="/rewards" element={<><Header /><main className="main-content"><ProtectedRoute><Rewards /></ProtectedRoute></main><Footer /></>} />

            {/* Admin Routes - with AdminLayout sidebar, no Header/Footer */}
            <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
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

            <Route path="*" element={<><Header /><main className="main-content"><NotFound /></main><Footer /></>} />
          </Routes>
        </Suspense>
        <Toaster position="bottom-center" />
        <Suspense fallback={null}>
          <ChatBot />
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;
