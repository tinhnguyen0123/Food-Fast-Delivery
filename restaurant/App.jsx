import { useEffect } from "react"
import { Routes, Route, useLocation, useNavigate, Navigate } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

// Pages
import LoginPage from "./pages/LoginPage"
import RestaurantDashboard from "./pages/RestaurantDashboard"
import OrdersPage from "./pages/OrderPage"
import MenuPage from "./pages/MenuPage"
import DronesPage from "./pages/DronePage"
import AnalyticsPage from "./pages/AnalyticsPage"
import ProfilePage from "./pages/Profile"
import RestaurantRegisterPage from "./pages/RestaurantRegisterPage"


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

      if (token && user?.role === "restaurant") {
        navigate("/dashboard/orders", { replace: true })
      }
    }
  }, [location.pathname, navigate])

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 text-gray-800">
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
          <Route path="/register-restaurant" element={<RestaurantRegisterPage />} />

          {/* Protected restaurant routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requiredRole="restaurant">
                <RestaurantDashboard />
              </ProtectedRoute>
            }
          >
            <Route path="orders" element={<OrdersPage />} />
            <Route path="menu" element={<MenuPage />} />
            <Route path="drones" element={<DronesPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="profile" element={<ProfilePage />} />
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