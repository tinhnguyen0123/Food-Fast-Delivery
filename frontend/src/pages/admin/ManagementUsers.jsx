import { useEffect, useState } from "react";
import {
  Search,
  Eye,
  Edit2,
  Shield,
  Store,
  User,
  UserPlus,
  Download,
  RefreshCw,
  Mail,
  Phone,
  Calendar,
  MoreVertical,
  Trash2,
  Lock,
  Unlock,
  CheckCircle,
  XCircle,
  Filter,
  Users as UsersIcon,
} from "lucide-react";

// ✅ Cấu hình API_BASE linh hoạt (ưu tiên biến môi trường)
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showActions, setShowActions] = useState(null);

  useEffect(() => {
    let mounted = true;
    const token = localStorage.getItem("token");

    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/api/user`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!mounted) return;
        if (!res.ok) {
          setUsers([]);
          return;
        }
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : data.users || []);
      } catch (err) {
        console.error("fetch users", err);
        setError("Failed to load users");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchUsers();
    return () => {
      mounted = false;
    };
  }, []);

  // ✅ Filter users
  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.phone?.toLowerCase().includes(q);
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    const matchesStatus = statusFilter === "all" || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // ✅ Calculate stats
  const stats = {
    total: users.length,
    admin: users.filter((u) => u.role === "admin").length,
    restaurant: users.filter((u) => u.role === "restaurant").length,
    customer: users.filter((u) => u.role === "customer").length,
    active: users.filter((u) => u.status === "active").length,
  };

  // ✅ Role icon & styling
  const getRoleConfig = (role) => {
    const configs = {
      admin: {
        icon: Shield,
        bg: "bg-purple-100",
        text: "text-purple-700",
        border: "border-purple-300",
        gradient: "from-purple-500 to-purple-600",
      },
      restaurant: {
        icon: Store,
        bg: "bg-orange-100",
        text: "text-orange-700",
        border: "border-orange-300",
        gradient: "from-orange-500 to-orange-600",
      },
      customer: {
        icon: User,
        bg: "bg-blue-100",
        text: "text-blue-700",
        border: "border-blue-300",
        gradient: "from-blue-500 to-blue-600",
      },
    };
    return (
      configs[role] || {
        icon: User,
        bg: "bg-gray-100",
        text: "text-gray-700",
        border: "border-gray-300",
        gradient: "from-gray-500 to-gray-600",
      }
    );
  };

  const roleFilters = [
    { value: "all", label: "Tất cả", count: stats.total },
    { value: "admin", label: "Admin", count: stats.admin },
    { value: "restaurant", label: "Nhà hàng", count: stats.restaurant },
    { value: "customer", label: "Khách hàng", count: stats.customer },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <UsersIcon className="w-6 h-6 text-white" />
            </div>
            Quản lý Người dùng
          </h1>
          <p className="text-gray-600 mt-1">
            Quản lý tất cả người dùng: admin, nhà hàng và khách hàng
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Tải lại
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all">
            <UserPlus className="w-4 h-4" />
            Thêm mới
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <UsersIcon className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold">{stats.total}</span>
          </div>
          <p className="text-purple-100 text-sm">Tổng người dùng</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold">{stats.customer}</span>
          </div>
          <p className="text-blue-100 text-sm">Khách hàng</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Store className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold">{stats.restaurant}</span>
          </div>
          <p className="text-orange-100 text-sm">Nhà hàng</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold">{stats.active}</span>
          </div>
          <p className="text-green-100 text-sm">Đang hoạt động</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                placeholder="Tìm kiếm theo tên, email, số điện thoại..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Role Filters */}
          <div className="flex flex-wrap gap-2">
            {roleFilters.map((f) => (
              <button
                key={f.value}
                onClick={() => setRoleFilter(f.value)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
                  roleFilter === f.value
                    ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <span>{f.label}</span>
                <span
                  className={`ml-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                    roleFilter === f.value
                      ? "bg-white/20 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {f.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Trạng thái:</span>
          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                statusFilter === "all"
                  ? "bg-purple-100 text-purple-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setStatusFilter("active")}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                statusFilter === "active"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Hoạt động
            </button>
            <button
              onClick={() => setStatusFilter("inactive")}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                statusFilter === "inactive"
                  ? "bg-red-100 text-red-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Không hoạt động
            </button>
          </div>
        </div>
      </div>

      {/* Users Grid */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <UsersIcon className="w-5 h-5 text-purple-600" />
              Danh sách người dùng ({filtered.length})
            </h2>
            <p className="text-sm text-gray-600">
              Hiển thị {filtered.length} / {users.length} người dùng
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <div className="animate-spin h-12 w-12 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-gray-600">Đang tải người dùng...</p>
            </div>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 font-semibold">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <UsersIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Không tìm thấy người dùng</p>
            <p className="text-gray-400 text-sm mt-1">
              Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {filtered.map((user) => {
              const roleConfig = getRoleConfig(user.role);
              const RoleIcon = roleConfig.icon;

              return (
                <div
                  key={user._id || user.id}
                  className="bg-white border-2 border-gray-200 rounded-xl hover:shadow-xl hover:border-purple-300 transition-all duration-200"
                >
                  {/* Header */}
                  <div className={`bg-gradient-to-r ${roleConfig.gradient} p-4 rounded-t-xl`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                          <span className="text-white font-bold text-lg">
                            {user.name?.[0]?.toUpperCase() || "U"}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-white font-bold text-lg">{user.name}</h3>
                          <p className="text-white/80 text-xs flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          setShowActions(showActions === user._id ? null : user._id)
                        }
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-5 h-5 text-white" />
                      </button>
                    </div>

                    {/* Actions Dropdown */}
                    {showActions === user._id && (
                      <div className="absolute right-4 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-10">
                        <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 w-full text-left text-sm">
                          <Eye className="w-4 h-4 text-blue-600" />
                          <span>Xem chi tiết</span>
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 w-full text-left text-sm">
                          <Edit2 className="w-4 h-4 text-orange-600" />
                          <span>Chỉnh sửa</span>
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 w-full text-left text-sm">
                          {user.status === "active" ? (
                            <>
                              <Lock className="w-4 h-4 text-red-600" />
                              <span>Khóa tài khoản</span>
                            </>
                          ) : (
                            <>
                              <Unlock className="w-4 h-4 text-green-600" />
                              <span>Mở khóa</span>
                            </>
                          )}
                        </button>
                        <hr className="my-2" />
                        <button className="flex items-center gap-2 px-4 py-2 hover:bg-red-50 w-full text-left text-sm text-red-600">
                          <Trash2 className="w-4 h-4" />
                          <span>Xóa</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-4 space-y-4">
                    {/* Phone */}
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {user.phone || "Chưa có số điện thoại"}
                      </span>
                    </div>

                    {/* Role & Status */}
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Vai trò</p>
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${roleConfig.bg} ${roleConfig.text} ${roleConfig.border}`}
                        >
                          <RoleIcon className="w-3.5 h-3.5" />
                          {user.role === "admin"
                            ? "Admin"
                            : user.role === "restaurant"
                            ? "Nhà hàng"
                            : "Khách hàng"}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Trạng thái</p>
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                            user.status === "active"
                              ? "bg-green-100 text-green-700 border border-green-300"
                              : "bg-red-100 text-red-700 border border-red-300"
                          }`}
                        >
                          {user.status === "active" ? (
                            <CheckCircle className="w-3.5 h-3.5" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5" />
                          )}
                          {user.status === "active" ? "Hoạt động" : "Không hoạt động"}
                        </span>
                      </div>
                    </div>

                    {/* Last Login */}
                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Đăng nhập gần nhất
                      </p>
                      <p className="text-sm text-gray-700 font-medium">
                        {user.lastLogin
                          ? new Date(user.lastLogin).toLocaleString("vi-VN")
                          : "Chưa đăng nhập"}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-3">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        Xem
                      </button>
                      <button className="px-4 py-2.5 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-800">Chi tiết người dùng</h3>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XCircle className="w-6 h-6 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <pre className="text-sm bg-gray-50 p-4 rounded-lg overflow-auto">
                {JSON.stringify(selectedUser, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}