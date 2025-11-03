import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  // Kiểm tra token khi component load hoặc khi route thay đổi
  useEffect(() => {
    checkLoginStatus();
  }, [location]); // Re-check khi đổi trang

  const checkLoginStatus = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
  };

  // Hàm logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div 
            onClick={() => navigate('/')}
            className="text-2xl font-bold text-blue-600 cursor-pointer hover:text-blue-700"
          >
            🚁 Drone Delivery
          </div>

          {/* Menu */}
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/')}
              className="text-gray-700 hover:text-blue-600 transition"
            >
              Trang chủ
            </button>

            <button 
             onClick={() => navigate('/products')}
             className="text-gray-700 hover:text-blue-600 transition"
           >
             Thực đơn
           </button>

            {isLoggedIn ? (
              // Hiển thị khi đã đăng nhập
              <>
                <button
                onClick={() => navigate("/cart")}
                className="text-gray-700 hover:text-blue-600 transition flex items-center gap-1"
              >
                🛒 Giỏ hàng
              </button>
                <button 
                  onClick={() => navigate('/orders')}
                  className="text-gray-700 hover:text-blue-600 transition"
                >
                  Đơn hàng
                </button>
                
                <div className="flex items-center gap-4">
                  <span className="text-gray-700">
                    Xin chào, <span className="font-semibold text-blue-600">{user?.name}</span>
                  </span>
                  
                  <button 
                    onClick={() => navigate('/profile')}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition"
                  >
                    👤Tài khoản
                  </button>
                  
                  <button 
                    onClick={handleLogout}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                  >
                    Đăng xuất
                  </button>
                </div>
              </>
            ) : (
              // Hiển thị khi chưa đăng nhập
              <>
                <button 
                  onClick={() => navigate('/login')}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                  Đăng nhập
                </button>
                <button 
                  onClick={() => navigate('/register')}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                >
                  Đăng ký
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}