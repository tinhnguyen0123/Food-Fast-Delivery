import { useEffect } from "react"
import { Routes, Route, useLocation, useNavigate, Navigate } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

// Components
import Navbar from "./components/Navbar"
import Footer from './components/Footer';
import ProtectedRoute from "./components/ProtectedRoute"

// Common pages
import HomePage from "./pages/common/HomePage"
import LoginPage from "./pages/common/LoginPage"
import RegisterPage from "./pages/common/RegisterPage"
import ProfilePage from "./pages/common/ProfilePage"
import ProductsPage from "./pages/common/ProductsPage"
import CartPage from "./pages/common/CartPage"
import OrdersPage from "./pages/common/OrdersPage"
import OrderDetailPage from "./pages/common/OrderDetailPage"
import PaymentPage from "./pages/common/PaymentPage"
import PaymentStatusPage from "./pages/common/PaymentStatusPage"
import RestaurantsPage from "./pages/common/RestaurantsPage"

// Restaurant pages
import RestaurantDashboard from "./pages/restaurant/RestaurantDashboard.jsx"
import RestaurantRegisterPage from "./pages/restaurant/RestaurantRegisterPage.jsx"

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard.jsx"
import ManagementOrders from "./pages/admin/ManagementOrders"
import ManagementUsers from "./pages/admin/ManagementUsers"
import ManagementRestaurants from "./pages/admin/ManagementRestaurants"
import ManagementDrones from "./pages/admin/ManagementDrones"
import AnalyticsPage from "./pages/admin/AnalyticsPageAd"

function App() {
  const navigate = useNavigate()
  const location = useLocation()

  // ✅ Tự động điều hướng theo role khi vào trang chủ
  useEffect(() => {
    if (location.pathname === "/") {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      const token = localStorage.getItem("token");

      if (token && user) {
        // Điều hướng theo role
        if (user.role === "admin") {
          navigate("/admin/orders", { replace: true });
        } else if (user.role === "restaurant") {
          navigate("/restaurant/dashboard", { replace: true });
        }
        // Customer thì ở lại trang chủ
      }
    }
  }, [location.pathname, navigate])

  // ✅ Chỉ ẩn Navbar & Footer cho các route quản trị
  const hideNavbarAndFooter =
    /^\/restaurant(\/|$)/.test(location.pathname) ||
    location.pathname.startsWith("/admin")

  return (
    <div className="flex flex-col min-h-screen bg-blue-50 text-gray-800">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
      />

      {/* ✅ Chỉ hiển thị Navbar cho customer */}
      {!hideNavbarAndFooter && <Navbar />}

      <main className="flex-1 p-6">
        <Routes>
          {/* 🌐 Public routes (chỉ cho customer chưa đăng nhập) */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/register-restaurant" element={<RestaurantRegisterPage />} />

          {/* 👤 Customer-only routes */}
          <Route
            path="/products"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <ProductsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/restaurants"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <RestaurantsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <CartPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <OrdersPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders/payment-status"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <PaymentStatusPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders/:id"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <OrderDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <PaymentPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/payment-status"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <PaymentStatusPage />
              </ProtectedRoute>
            }
          />

          {/* 🍽️ Restaurant dashboard (chỉ cho restaurant) */}
          <Route
            path="/restaurant/dashboard"
            element={
              <ProtectedRoute requiredRole="restaurant">
                <RestaurantDashboard />
              </ProtectedRoute>
            }
          />

          {/* 👑 Admin dashboard (chỉ cho admin) */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          >
            <Route path="orders" element={<ManagementOrders />} />
            <Route path="users" element={<ManagementUsers />} />
            <Route path="restaurants" element={<ManagementRestaurants />} />
            <Route path="drones" element={<ManagementDrones />} />
            <Route path="analytics" element={<AnalyticsPage />} />
          </Route>

          {/* 404 - Redirect về trang tương ứng */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* ✅ Footer cho tất cả trang customer/public */}
      {!hideNavbarAndFooter && <Footer />}
    </div>
  )
}

export default App