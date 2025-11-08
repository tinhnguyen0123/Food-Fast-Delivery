// ...existing code...
import { useEffect } from "react"
import { Routes, Route, useLocation, useNavigate, Navigate } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

// Components
import Navbar from "./components/Navbar"
import ProtectedRoute from "./components/ProtectedRoute"

// Common pages
import HomePage from "./pages/common/HomePage"
import LoginPage from "./pages/common/LoginPage"
import RegisterPage from "./pages/common/RegisterPage"
import ProfilePage from "./pages/ProfilePage"
import ProductsPage from "./pages/common/ProductsPage"
import CartPage from "./pages/common/CartPage"
import CheckoutPage from "./pages/common/CheckoutPage"
import OrdersPage from "./pages/common/OrdersPage"
import OrderDetailPage from "./pages/common/OrderDetailPage"
import PaymentPage from "./pages/common/PaymentPage"

// 🔹 changed code: import RestaurantsPage
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

  // ✅ Tự động điều hướng theo môi trường (VD: admin, restaurant, customer)
  useEffect(() => {
    const target = (import.meta.env.VITE_TARGET || "customer").toUpperCase()
    const defaultRoute = import.meta.env[`VITE_DEFAULT_ROUTE_${target}`]

    if (location.pathname === "/" && defaultRoute) {
      navigate(defaultRoute, { replace: true })
    }
  }, [location.pathname, navigate])

  // ✅ Chỉ ẩn Navbar cho các route bắt đầu chính xác bằng "/restaurant" (không ẩn "/restaurants")
  const hideNavbar =
    /^\/restaurant(\/|$)/.test(location.pathname) ||
    location.pathname.startsWith("/admin")

  return (
    <div className="min-h-screen bg-blue-50 text-gray-800">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
      />

      {/* ✅ Chỉ hiển thị Navbar nếu không thuộc khu vực quản trị hoặc route restaurant dashboard */}
      {!hideNavbar && <Navbar />}

      <main className="p-6">
        <Routes>
          {/* 🌐 Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          {/* 🔹 changed code: thêm route /restaurants */}
          <Route path="/restaurants" element={<RestaurantsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/register-restaurant" element={<RestaurantRegisterPage />} />

          {/* 👤 Protected user routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <CartPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/new"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <ProtectedRoute>
                <OrderDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment"
            element={
              <ProtectedRoute>
                <PaymentPage />
              </ProtectedRoute>
            }
          />

          {/* 🍽️ Restaurant dashboard */}
          <Route
            path="/restaurant/dashboard"
            element={
              <ProtectedRoute requiredRole="restaurant">
                <RestaurantDashboard />
              </ProtectedRoute>
            }
          />

          {/* 👑 Admin dashboard (nested routes) */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="orders" replace />} />
            <Route path="orders" element={<ManagementOrders />} />
            <Route path="users" element={<ManagementUsers />} />
            <Route path="restaurants" element={<ManagementRestaurants />} />
            <Route path="drones" element={<ManagementDrones />} />
            <Route path="analytics" element={<AnalyticsPage />} />
          </Route>
        </Routes>
      </main>
    </div>
  )
}

export default App
