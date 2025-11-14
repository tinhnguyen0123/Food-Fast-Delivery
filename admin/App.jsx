import { useEffect } from "react"
import { Routes, Route, useLocation, useNavigate, Navigate } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

// Pages
import LoginPage from "./pages/LoginPage"
import AdminDashboard from "./pages/AdminDashboard"
import ManagementOrders from "./pages/ManagementOrders"
import ManagementUsers from "./pages/ManagementUsers"
import ManagementRestaurants from "./pages/ManagementRestaurants"
import ManagementDrones from "./pages/ManagementDrones"
import AnalyticsPage from "./pages/AnalyticsPageAd"

// Components
import ProtectedRoute from "./components/ProtectedRoute"

function App() {
  const navigate = useNavigate()
  const location = useLocation()

  // ✅ Tự động điều hướng theo token khi vào trang chủ
  useEffect(() => {
    if (location.pathname === "/") {
      const token = localStorage.getItem("token")
      const user = JSON.parse(localStorage.getItem("user") || "null")

      if (token && user?.role === "admin") {
        navigate("/dashboard/orders", { replace: true })
      }
    }
  }, [location.pathname, navigate])

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-gray-800">
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

      <main className="flex-1">
        <Routes>
          {/* Public route - Login */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Protected admin routes */}
          <Route
            path="/dashboard"
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
            <Route index element={<Navigate to="orders" replace />} />
          </Route>

          {/* Redirect unknowns */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default App