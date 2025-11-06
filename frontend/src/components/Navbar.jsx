import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  useEffect(() => {
    checkLoginStatus();
  }, [location]);

  // 🔹 Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    navigate('/login');
    setIsProfileDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const toggleProfileDropdown = () => setIsProfileDropdownOpen(!isProfileDropdownOpen);
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          
          {/* LOGO */}
          <div
            onClick={() => navigate('/products')}
            className={`text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent cursor-pointer hover:scale-105 transition-transform ${
              isActive('/') ? 'scale-105' : ''
            }`}
          >
            🚁 Drone Delivery
          </div>

          {/* Hamburger menu */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-gray-700 hover:text-blue-600 p-2 rounded-md transition text-xl"
            >
              {isMobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => navigate('/products')}
              className={`font-medium transition-colors px-3 py-2 rounded-lg hover:bg-blue-50 ${
                isActive('/products')
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              🍽️ Thực đơn
            </button>

            {/* 🔹 Thêm nút Quản lý nhà hàng cho role restaurant */}
            {isLoggedIn && user?.role === 'restaurant' && (
              <button
                onClick={() => navigate('/restaurant/dashboard')}
                className={`font-medium transition-colors px-3 py-2 rounded-lg hover:bg-blue-50 ${
                  isActive('/restaurant/dashboard')
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                🏪 Quản lý nhà hàng
              </button>
            )}

            {isLoggedIn ? (
              <>
                <button
                  onClick={() => navigate('/cart')}
                  className={`font-medium transition-colors px-3 py-2 rounded-lg hover:bg-blue-50 flex items-center gap-1 ${
                    isActive('/cart')
                      ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  🛒 Giỏ hàng
                </button>

                {/* Dropdown tài khoản */}
                <div className="relative ml-4" ref={dropdownRef}>
                  <span className="text-gray-600 text-sm hidden sm:block mr-4">
                    Chào, <span className="font-semibold text-blue-600">{user?.name}</span>
                  </span>

                  <button
                    onClick={toggleProfileDropdown}
                    className={`bg-gray-100 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-200 transition-shadow shadow-sm flex items-center gap-1 text-sm ${
                      isActive('/profile')
                        ? 'bg-blue-50 text-blue-600 border border-blue-200'
                        : ''
                    }`}
                  >
                    👤 Tài khoản
                    <span
                      className={`transition-transform ml-1 ${isProfileDropdownOpen ? 'rotate-180' : ''}`}
                    >
                      ▼
                    </span>
                  </button>

                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-10 animate-in fade-in slide-in-from-top-2 duration-200">
                      {!isActive('/profile') && (
                        <button
                          onClick={() => {
                            navigate('/profile');
                            setIsProfileDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 transition-colors text-sm"
                        >
                          📝 Xem profile
                        </button>
                      )}

                      <button
                        onClick={() => {
                          navigate('/orders');
                          setIsProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 transition-colors text-sm"
                      >
                        📦 Đơn hàng
                      </button>

                      {/* 🔹 Thêm nút Quản lý nhà hàng trong dropdown */}
                      {user?.role === 'restaurant' && (
                        <button
                          onClick={() => {
                            navigate('/restaurant/dashboard');
                            setIsProfileDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 transition-colors text-sm"
                        >
                          🏪 Quản lý nhà hàng
                        </button>
                      )}

                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors text-sm"
                      >
                        🚪 Đăng xuất
                      </button>
                    </div>
                  )}
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

        {/* MOBILE MENU */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200">
            <div className="flex flex-col gap-3 pt-4">
              <button
                onClick={() => {
                  navigate('/products');
                  setIsMobileMenuOpen(false);
                }}
                className={`font-medium w-full text-left py-2 px-4 rounded-lg hover:bg-blue-50 ${
                  isActive('/products')
                    ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                🍽️ Thực đơn
              </button>

              {/* 🔹 Thêm nút Quản lý nhà hàng cho mobile */}
              {isLoggedIn && user?.role === 'restaurant' && (
                <button
                  onClick={() => {
                    navigate('/restaurant/dashboard');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`font-medium w-full text-left py-2 px-4 rounded-lg hover:bg-blue-50 ${
                    isActive('/restaurant/dashboard')
                      ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  🏪 Quản lý nhà hàng
                </button>
              )}

              {isLoggedIn ? (
                <>
                  <button
                    onClick={() => {
                      navigate('/cart');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`font-medium w-full text-left py-2 px-4 rounded-lg hover:bg-blue-50 ${
                      isActive('/cart')
                        ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                        : 'text-gray-700 hover:text-blue-600'
                    }`}
                  >
                    🛒 Giỏ hàng
                  </button>

                  <button
                    onClick={() => {
                      navigate('/orders');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`font-medium w-full text-left py-2 px-4 rounded-lg hover:bg-blue-50 ${
                      isActive('/orders')
                        ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                        : 'text-gray-700 hover:text-blue-600'
                    }`}
                  >
                    📦 Đơn hàng
                  </button>

                  <div className="flex flex-col gap-2 pt-2 border-t border-gray-200">
                    <span className="text-gray-600 text-sm px-4 pt-2">
                      Chào, <span className="font-semibold text-blue-600">{user?.name}</span>
                    </span>

                    <button
                      onClick={() => {
                        navigate('/profile');
                        setIsMobileMenuOpen(false);
                      }}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-200 transition-shadow shadow-sm text-sm w-full text-left"
                    >
                      👤 Xem profile
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
                    className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 shadow-sm text-sm w-full"
                  >
                    🔑 Đăng nhập
                  </button>
                  <button
                    onClick={() => {
                      navigate('/register');
                      setIsMobileMenuOpen(false);
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 shadow-sm text-sm w-full"
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
