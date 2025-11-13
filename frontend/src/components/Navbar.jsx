import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell } from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("notifQueue") || "[]");
    } catch {
      return [];
    }
  });
  const [showNotifications, setShowNotifications] = useState(false);
  const [arrivedOrders, setArrivedOrders] = useState(new Set()); // Track đơn đã thông báo

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();
  const token = localStorage.getItem("token");

  const safeNavigate = (path) => {
    setIsProfileDropdownOpen(false);
    setIsMobileMenuOpen(false);
    setShowNotifications(false);
    setTimeout(() => navigate(path), 100);
  };

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Notifications helpers
  const loadStatusMap = () => {
    try {
      return JSON.parse(localStorage.getItem("orderStatusMap") || "{}");
    } catch {
      return {};
    }
  };
  const saveStatusMap = (m) => localStorage.setItem("orderStatusMap", JSON.stringify(m));
  const saveNotifications = (list) => localStorage.setItem("notifQueue", JSON.stringify(list));

  const addNotification = (notif) => {
    setNotifications((prev) => {
      const next = [{ id: `${Date.now()}-${Math.random()}`, unread: true, ...notif }, ...prev].slice(0, 20);
      saveNotifications(next);
      return next;
    });
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllRead = () => {
    setNotifications((prev) => {
      const next = prev.map((n) => ({ ...n, unread: false }));
      saveNotifications(next);
      return next;
    });
  };

  const removeNotification = (id) => {
    setNotifications((prev) => {
      const next = prev.filter((n) => n.id !== id);
      saveNotifications(next);
      return next;
    });
  };

  // Polling orders - phát hiện arrived dựa trên arrivedNotified
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = user?.id || user?._id;
    if (!token || !userId) return;

    let mounted = true;
    let timerId;

    const poll = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE || "http://localhost:5000"}/api/order/user/${userId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!res.ok) return;
        const data = await res.json();
        const orders = Array.isArray(data) ? data : data.orders || [];
        if (!mounted) return;

        const statusMap = loadStatusMap();

        for (const o of orders) {
          const id = o._id;
          const old = statusMap[id];
          const now = o.status;

          // Drone bắt đầu giao
          if (now === "delivering" && old !== "delivering") {
            const shortId = id.slice(-6);
            addNotification({
              type: "delivery-start",
              orderId: id,
              title: "Drone đã nhận đơn",
              message: `Đơn hàng #${shortId} đang được giao.`,
              createdAt: new Date().toISOString(),
            });
          }

          // Drone đã đến nơi
          if (o.arrivedNotified && !arrivedOrders.has(id) && now === "delivering") {
            const shortId = id.slice(-6);
            addNotification({
              type: "arrival",
              orderId: id,
              title: "Đơn hàng đã đến nơi",
              message: `Đơn hàng #${shortId} đã giao đến. Vui lòng xác nhận nhận hàng.`,
              createdAt: new Date().toISOString(),
            });
            setArrivedOrders(prev => new Set(prev).add(id));
          }

          // **Bỏ đoạn xóa thông báo tự động khi completed**
          statusMap[id] = now;
        }

        saveStatusMap(statusMap);
      } catch {
        // ignore
      }
    };

    poll();
    timerId = setInterval(poll, 3000);

    return () => {
      mounted = false;
      if (timerId) clearInterval(timerId);
    };
  }, [user?.id, user?._id, token, arrivedOrders]);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const toggleProfileDropdown = () => setIsProfileDropdownOpen(!isProfileDropdownOpen);
  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('myRestaurantId');
    safeNavigate('/login');
  };

  const isCustomer = user?.role === 'customer' || !user;
  if (!isCustomer) return null;

  return (
    <nav className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* LOGO */}
          <div
            onClick={() => safeNavigate('/')}
            className={`text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent cursor-pointer hover:scale-105 transition-transform ${isActive('/') ? 'scale-105' : ''}`}
          >
            🚁 Food Fast
          </div>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => safeNavigate('/restaurants')} className={`font-medium px-3 py-2 rounded-lg hover:bg-blue-50 ${isActive('/restaurants') ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-700 hover:text-blue-600'}`}>🏬 Nhà hàng</button>

            {token && (
              <>
                <button onClick={() => safeNavigate('/products')} className={`font-medium px-3 py-2 rounded-lg hover:bg-blue-50 ${isActive('/products') ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-700 hover:text-blue-600'}`}>🍽️ Thực đơn</button>
                <button onClick={() => safeNavigate('/cart')} className={`font-medium px-3 py-2 rounded-lg hover:bg-blue-50 flex items-center gap-1 ${isActive('/cart') ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-700 hover:text-blue-600'}`}>🛒 Giỏ hàng</button>

                {/* Notifications */}
                <div className="relative">
                  <button type="button" onClick={() => setShowNotifications((s) => !s)} className="relative bg-gray-100 text-gray-700 px-3 py-2 rounded-xl hover:bg-gray-200 transition-shadow shadow-sm text-sm" title="Thông báo">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1.5">{unreadCount}</span>}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                      <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
                        <span className="font-semibold text-gray-800">Thông báo</span>
                        <button onClick={markAllRead} className="text-xs text-blue-600 hover:underline">Đánh dấu đã đọc</button>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-gray-500 text-sm">Không có thông báo</div>
                        ) : (
                          notifications.map((n) => (
                            <div key={n.id} className={`p-4 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer ${n.unread ? "bg-blue-50/40" : ""}`}
                              onClick={() => {
                                if (n.orderId) safeNavigate(`/orders/${n.orderId}`);
                                else safeNavigate("/orders");
                                setNotifications((prev) => {
                                  const next = prev.map((x) => x.id === n.id ? { ...x, unread: false } : x);
                                  saveNotifications(next);
                                  return next;
                                });
                                setShowNotifications(false);
                              }}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-sm font-semibold text-gray-800">{n.title}</p>
                                  <p className="text-sm text-gray-600">{n.message}</p>
                                  <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleTimeString("vi-VN")}</p>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); removeNotification(n.id); }} className="text-gray-400 hover:text-red-500" title="Xóa">×</button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)} className="flex items-center gap-2 font-medium text-gray-700 hover:text-blue-600 transition-colors px-3 py-2 rounded-lg hover:bg-blue-50">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">{user?.name?.charAt(0).toUpperCase() || 'U'}</div>
                    <span>{user?.name}</span>
                  </button>
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-10 animate-in fade-in slide-in-from-top-2 duration-200">
                      {!isActive('/profile') && <button onClick={() => safeNavigate('/profile')} className="w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 transition-colors text-sm">📝 Thông tin cá nhân</button>}
                      <button onClick={() => safeNavigate('/orders')} className="w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 transition-colors text-sm">📦 Đơn hàng</button>
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors text-sm">🚪 Đăng xuất</button>
                    </div>
                  )}
                </div>
              </>
            )}

            {!token && (
              <>
                <button onClick={() => safeNavigate('/login')} className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-shadow shadow-sm text-sm">🔑 Đăng nhập</button>
                <button onClick={() => safeNavigate('/register')} className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition-shadow shadow-sm text-sm ml-2">📝 Đăng ký</button>
              </>
            )}
          </div>

          {/* MOBILE MENU */}
          <div className="md:hidden">
            <button onClick={toggleMobileMenu} className="text-gray-700 hover:text-blue-600 p-2 rounded-md transition text-xl">
              {isMobileMenuOpen ? '✕' : '☰'}
            </button>
            {isMobileMenuOpen && (
              <div className="mt-4 pb-4 border-t border-gray-200 flex flex-col gap-3 pt-4">
                <button onClick={() => safeNavigate('/restaurants')} className={`font-medium w-full text-left py-2 px-4 rounded-lg hover:bg-blue-50 ${isActive('/restaurants') ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600' : 'text-gray-700 hover:text-blue-600'}`}>🏬 Nhà hàng</button>
                {token && (
                  <>
                    <button onClick={() => safeNavigate('/products')} className={`font-medium w-full text-left py-2 px-4 rounded-lg hover:bg-blue-50 ${isActive('/products') ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600' : 'text-gray-700 hover:text-blue-600'}`}>🍽️ Thực đơn</button>
                    <button onClick={() => safeNavigate('/cart')} className={`font-medium w-full text-left py-2 px-4 rounded-lg hover:bg-blue-50 ${isActive('/cart') ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600' : 'text-gray-700 hover:text-blue-600'}`}>🛒 Giỏ hàng</button>
                    <button onClick={() => safeNavigate('/profile')} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-200 transition-shadow shadow-sm text-sm w-full text-left">👤 Xem profile</button>
                    <button onClick={() => safeNavigate('/orders')} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-200 transition-shadow shadow-sm text-sm w-full text-left">📦 Đơn hàng</button>
                    <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition-shadow shadow-sm text-sm w-full">🚪 Đăng xuất</button>
                  </>
                )}
                {!token && (
                  <>
                    <button onClick={() => safeNavigate('/login')} className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-shadow shadow-sm text-sm w-full">🔑 Đăng nhập</button>
                    <button onClick={() => safeNavigate('/register')} className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition-shadow shadow-sm text-sm w-full">📝 Đăng ký</button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
