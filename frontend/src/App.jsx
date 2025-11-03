import { Routes, Route } from "react-router-dom";  // Xóa Link, useNavigate, useLocation vì không cần nữa
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar';  // Import Navbar ở đây
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


function App() {
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

      {/* Thay header cũ bằng Navbar */}
      { <Navbar />}

      <main className="p-6">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Protected Routes - giữ nguyên, nó sẽ tự check token */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/orders" element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          } />
          <Route path="/orders/:id" element={
            <ProtectedRoute>
              <OrderDetailPage />
            </ProtectedRoute>
          } />
          <Route path="/cart" element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          } />
         
        </Routes>
      </main>
    </div>
  );
}

export default App;