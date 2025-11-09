import { useEffect, useState } from "react";
import {
  Search,
  Eye,
  Edit2,
  Shield,
  Store,
  User,
  Users as UsersIcon,
  Mail,
  Phone,
  Calendar,
  MoreVertical,
  Trash2,
  Lock,
  Unlock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "react-toastify";

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

  const token = localStorage.getItem("token");

  useEffect(() => {
    let mounted = true;

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
  }, [token]);

  // 🔹 Xóa tài khoản
  const deleteUser = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa tài khoản này? Hành động không thể hoàn tác.")) return;
    try {
      const res = await fetch(`${API_BASE}/api/user/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Xóa tài khoản thất bại");
      setUsers((prev) => prev.filter((u) => u._id !== id));
      toast.success("Đã xóa tài khoản");
    } catch (e) {
      console.error(e);
      toast.error(e.message || "Lỗi xóa tài khoản");
    }
  };

  // 🔹 Khóa / mở khóa tài khoản
  const toggleLock = async (u) => {
    const targetStatus = u.status === "suspended" ? "active" : "suspended";
    try {
      const url = `${API_BASE}/api/user/${u._id}/${targetStatus === "suspended" ? "lock" : "unlock"}`;
      const res = await fetch(url, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Thao tác thất bại");
      setUsers((prev) => prev.map((x) => (x._id === u._id ? data.user : x)));
      toast.success(targetStatus === "suspended" ? "Đã khóa tài khoản" : "Đã mở khóa");
    } catch (e) {
      toast.error(e.message);
    }
  };

  // 🔹 Lọc người dùng
  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.phone?.toLowerCase().includes(q);
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    const matchesStatus = statusFilter === "all" || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const stats = {
    total: users.length,
    admin: users.filter((u) => u.role === "admin").length,
    restaurant: users.filter((u) => u.role === "restaurant").length,
    customer: users.filter((u) => u.role === "customer").length,
    active: users.filter((u) => u.status === "active").length,
  };

  const getRoleConfig = (role) => {
    const configs = {
      admin: { icon: Shield, bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-300", gradient: "from-purple-500 to-purple-600" },
      restaurant: { icon: Store, bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-300", gradient: "from-orange-500 to-orange-600" },
      customer: { icon: User, bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-300", gradient: "from-blue-500 to-blue-600" },
    };
    return configs[role] || { icon: User, bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-300", gradient: "from-gray-500 to-gray-600" };
  };

  return (
    <div className="space-y-6">
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
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <UsersIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Không tìm thấy người dùng</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {filtered.map((user) => {
              const roleConfig = getRoleConfig(user.role);
              const RoleIcon = roleConfig.icon;

              return (
                <div key={user._id || user.id} className="bg-white border-2 border-gray-200 rounded-xl hover:shadow-xl hover:border-purple-300 transition-all duration-200">
                  {/* Header */}
                  <div className={`bg-gradient-to-r ${roleConfig.gradient} p-4 rounded-t-xl relative`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                          <span className="text-white font-bold text-lg">{user.name?.[0]?.toUpperCase() || "U"}</span>
                        </div>
                        <div>
                          <h3 className="text-white font-bold text-lg">{user.name}</h3>
                          <p className="text-white/80 text-xs flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <button onClick={() => setShowActions(showActions === user._id ? null : user._id)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
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
                        <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 w-full text-left text-sm" onClick={() => toggleLock(user)}>
                          {user.status === "suspended" ? (
                            <>
                              <Unlock className="w-4 h-4 text-green-600" />
                              <span>Mở khóa</span>
                            </>
                          ) : (
                            <>
                              <Lock className="w-4 h-4 text-red-600" />
                              <span>Khóa</span>
                            </>
                          )}
                        </button>
                        <hr className="my-2" />
                        <button className="flex items-center gap-2 px-4 py-2 hover:bg-red-50 w-full text-left text-sm text-red-600" onClick={() => deleteUser(user._id)}>
                          <Trash2 className="w-4 h-4" />
                          <span>Xóa</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-4 space-y-4">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{user.phone || "Chưa có số điện thoại"}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Vai trò</p>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${roleConfig.bg} ${roleConfig.text} ${roleConfig.border}`}>
                          <RoleIcon className="w-3.5 h-3.5" />
                          {user.role === "admin" ? "Admin" : user.role === "restaurant" ? "Nhà hàng" : "Khách hàng"}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Trạng thái</p>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${user.status === "active" ? "bg-green-100 text-green-700 border border-green-300" : "bg-red-100 text-red-700 border border-red-300"}`}>
                          {user.status === "active" ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                          {user.status === "active" ? "Hoạt động" : "Không hoạt động"}
                        </span>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Đăng nhập gần nhất
                      </p>
                      <p className="text-sm text-gray-700 font-medium">{user.lastLogin ? new Date(user.lastLogin).toLocaleString("vi-VN") : "Chưa đăng nhập"}</p>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setSelectedUser(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-800">Chi tiết người dùng</h3>
                <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <XCircle className="w-6 h-6 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <pre className="text-sm bg-gray-50 p-4 rounded-lg overflow-auto">{JSON.stringify(selectedUser, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
