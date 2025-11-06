import { Routes, Route, useLocation } from "react-router-dom";  
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "./components/Navbar"; 
import HomePage from "./pages/common/HomePage";
import LoginPage from "./pages/common/LoginPage";
import RegisterPage from "./pages/common/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import ProtectedRoute from "./components/ProtectedRoute";
import ProductsPage from "./pages/common/ProductsPage";
import CartPage from "./pages/common/CartPage";
import CheckoutPage from "./pages/common/CheckoutPage";
import OrdersPage from "./pages/common/OrdersPage";
import OrderDetailPage from "./pages/common/OrderDetailPage";
import PaymentPage from "./pages/common/PaymentPage";
import RestaurantDashboard from "./pages/restaurant/RestaurantDashboard.jsx";
import RestaurantRegisterPage from "./pages/restaurant/RestaurantRegisterPage.jsx";

function App() {
  const location = useLocation();
  const hideNavbar = location.pathname.startsWith("/restaurant");

  return (
    <div className="min-h-screen bg-blue-50 text-gray-800">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      {/* ✅ Chỉ hiển thị Navbar nếu KHÔNG nằm trong khu vực /restaurant */}
      {!hideNavbar && <Navbar />}

      <main className="p-6">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/register-restaurant" element={<RestaurantRegisterPage />} />  

          {/* Protected routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/restaurant/dashboard"
            element={
              <ProtectedRoute>
                <RestaurantDashboard />
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
            path="/cart"
            element={
              <ProtectedRoute>
                <CartPage />
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
        </Routes>
      </main>
    </div>
  );
}

export default App;
