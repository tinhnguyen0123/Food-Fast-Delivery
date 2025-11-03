import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State cho mobile menu

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
    setIsMobileMenuOpen(false); // Đóng menu mobile sau logout
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div 
            onClick={() => navigate('/')}
            className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent cursor-pointer hover:scale-105 transition-transform"
          >
            🚁 Drone Delivery
          </div>

          {/* Hamburger cho mobile */}
          <div className="md:hidden">
            <button 
              onClick={toggleMobileMenu}
              className="text-gray-700 hover:text-blue-600 p-2 rounded-md transition text-xl"
            >
              {isMobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <button 
              onClick={() => navigate('/products')}
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-blue-50"
            >
              🍽️ Thực đơn
            </button>

            {isLoggedIn ? (
              <>
                <button
                  onClick={() => navigate("/cart")}
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-blue-50 flex items-center gap-1"
                >
                  🛒 Giỏ hàng
                </button>
                <button 
                  onClick={() => navigate('/orders')}
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-blue-50"
                >
                  📦 Đơn hàng
                </button>
                
                <div className="flex items-center gap-4 ml-4">
                  <span className="text-gray-600 text-sm hidden sm:block">
                    Chào, <span className="font-semibold text-blue-600">{user?.name}</span>
                  </span>
                  
                  <button 
                    onClick={() => navigate('/profile')}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-200 transition-shadow shadow-sm flex items-center gap-1 text-sm"
                  >
                    👤 Tài khoản
                  </button>
                  
                  <button 
                    onClick={handleLogout}
                    className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition-shadow shadow-sm text-sm"
                  >
                    🚪 Đăng xuất
                  </button>
                </div>
              </>
            ) : (
              <>
                <button 
                  onClick={() => navigate('/login')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-shadow shadow-sm text-sm"
                >
                  🔑 Đăng nhập
                </button>
                <button 
                  onClick={() => navigate('/register')}
                  className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition-shadow shadow-sm text-sm ml-2"
                >
                  📝 Đăng ký
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu - Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200">
            <div className="flex flex-col gap-3 pt-4">
              <button 
                onClick={() => {
                  navigate('/products');
                  setIsMobileMenuOpen(false);
                }}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors w-full text-left py-2 px-4 rounded-lg hover:bg-blue-50"
              >
                🍽️ Thực đơn
              </button>

              {isLoggedIn ? (
                <>
                  <button
                    onClick={() => {
                      navigate("/cart");
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-gray-700 hover:text-blue-600 font-medium transition-colors w-full text-left py-2 px-4 rounded-lg hover:bg-blue-50 flex items-center gap-1"
                  >
                    🛒 Giỏ hàng
                  </button>
                  <button 
                    onClick={() => {
                      navigate('/orders');
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-gray-700 hover:text-blue-600 font-medium transition-colors w-full text-left py-2 px-4 rounded-lg hover:bg-blue-50"
                  >
                    📦 Đơn hàng
                  </button>
                  
                  <div className="flex flex-col gap-2 pt-2">
                    <span className="text-gray-600 text-sm px-4">
                      Chào, <span className="font-semibold text-blue-600">{user?.name}</span>
                    </span>
                    
                    <button 
                      onClick={() => {
                        navigate('/profile');
                        setIsMobileMenuOpen(false);
                      }}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-200 transition-shadow shadow-sm flex items-center gap-1 text-sm w-full justify-start"
                    >
                      👤 Tài khoản
                    </button>
                    
                    <button 
                      onClick={handleLogout}
                      className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition-shadow shadow-sm text-sm w-full"
                    >
                      🚪 Đăng xuất
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => {
                      navigate('/login');
                      setIsMobileMenuOpen(false);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-shadow shadow-sm text-sm w-full"
                  >
                    🔑 Đăng nhập
                  </button>
                  <button 
                    onClick={() => {
                      navigate('/register');
                      setIsMobileMenuOpen(false);
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition-shadow shadow-sm text-sm w-full"
                  >
                    📝 Đăng ký
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}