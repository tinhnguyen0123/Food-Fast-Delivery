import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

// Common pages
import HomePage from "./pages/common/HomePage";
import LoginPage from "./pages/common/LoginPage";
import RegisterPage from "./pages/common/RegisterPage";
import ProfilePage from "./pages/common/ProfilePage";
import ProductsPage from "./pages/common/ProductsPage";
import CartPage from "./pages/common/CartPage";
import OrdersPage from "./pages/common/OrdersPage";
import OrderDetailPage from "./pages/common/OrderDetailPage";
import PaymentPage from "./pages/common/PaymentPage";
import PaymentStatusPage from "./pages/common/PaymentStatusPage";
import RestaurantsPage from "./pages/common/RestaurantsPage";

function App() {
  const location = useLocation();

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

      <Navbar />

      <main className="flex-1 p-6">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Customer-only routes */}
          <Route
            path="/products"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <ProductsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/restaurants"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <RestaurantsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <CartPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/payment-status"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <PaymentStatusPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <OrderDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <PaymentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment-status"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <PaymentStatusPage />
              </ProtectedRoute>
            }
          />

          {/* 404 - Redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;