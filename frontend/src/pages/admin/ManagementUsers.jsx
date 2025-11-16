import { useEffect, useState } from "react";
import {
  Search,
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
  const [showActions, setShowActions] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    let mounted = true;

    const fetchUsers = async () => {
      setLoading(true);
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
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchUsers();
    return () => {
      mounted = false;
    };
  }, [token]);

  // Xóa tài khoản
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
      toast.error(e.message || "Lỗi xóa tài khoản");
    }
  };

  // Khóa / mở khóa
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

  // Lọc
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

  const getRoleBadge = (role) => {
    switch (role) {
      case "admin":
        return { icon: Shield, color: "bg-purple-100 text-purple-700 border-purple-200", label: "Admin" };
      case "restaurant":
        return { icon: Store, color: "bg-orange-100 text-orange-700 border-orange-200", label: "Nhà hàng" };
      default:
        return { icon: User, color: "bg-blue-100 text-blue-700 border-blue-200", label: "Khách hàng" };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý người dùng</h1>
          <p className="mt-2 text-gray-600">Xem và quản lý tất cả tài khoản trên hệ thống</p>
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, email, số điện thoại..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả vai trò</option>
                <option value="customer">Khách hàng</option>
                <option value="restaurant">Nhà hàng</option>
                <option value="admin">Admin</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Hoạt động</option>
                <option value="suspended">Bị khóa</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="text-sm text-gray-600 mb-4">
          Đang hiển thị <span className="font-semibold">{filtered.length}</span> trong tổng số{" "}
          <span className="font-semibold">{users.length}</span> người dùng
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-gray-600">Đang tải danh sách người dùng...</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-16 text-center">
            <UsersIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-lg text-gray-500">Không tìm thấy người dùng nào</p>
          </div>
        ) : (
          /* Table */
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Người dùng
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vai trò
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Số điện thoại
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Đăng nhập gần nhất
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filtered.map((user) => {
                    const { icon: RoleIcon, color, label } = getRoleBadge(user.role);

                    return (
                      <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-200 border-2 border-dashed rounded-full flex items-center justify-center text-xl font-bold text-gray-600">
                              {user.name?.[0]?.toUpperCase() || "U"}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500 flex items-center gap-1">
                                <Mail className="w-3.5 h-3.5" />
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${color}`}
                          >
                            <RoleIcon className="w-4 h-4" />
                            {label}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                              user.status === "active"
                                ? "bg-green-100 text-green-700 border border-green-200"
                                : "bg-red-100 text-red-700 border border-red-200"
                            }`}
                          >
                            {user.status === "active" ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <XCircle className="w-4 h-4" />
                            )}
                            {user.status === "active" ? "Hoạt động" : "Bị khóa"}
                          </span>
                        </td>

                        <td className="px-6 py-5 text-sm text-gray-600">
                          {user.phone || "—"}
                        </td>

                        <td className="px-6 py-5 text-sm text-gray-600">
                          {user.lastLogin
                            ? new Date(user.lastLogin).toLocaleString("vi-VN")
                            : "Chưa đăng nhập"}
                        </td>

                        <td className="px-6 py-5 text-right">
                          <div className="relative inline-block">
                            <button
                              onClick={() => setShowActions(showActions === user._id ? null : user._id)}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <MoreVertical className="w-5 h-5 text-gray-500" />
                            </button>

                            {showActions === user._id && (
                              <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                                <button
                                  onClick={() => toggleLock(user)}
                                  className="flex items-center gap-2 w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50"
                                >
                                  {user.status === "suspended" ? (
                                    <>
                                      <Unlock className="w-4 h-4 text-green-600" />
                                      <span>Mở khóa tài khoản</span>
                                    </>
                                  ) : (
                                    <>
                                      <Lock className="w-4 h-4 text-red-600" />
                                      <span>Khóa tài khoản</span>
                                    </>
                                  )}
                                </button>
                                <hr className="my-1" />
                                <button
                                  onClick={() => deleteUser(user._id)}
                                  className="flex items-center gap-2 w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  <span>Xóa tài khoản</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}