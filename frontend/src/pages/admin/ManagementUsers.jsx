import { useEffect, useState } from "react";
import { Search, Eye, Edit2, Shield, Store, User } from "lucide-react";

// ✅ Cấu hình API_BASE linh hoạt (ưu tiên biến môi trường)
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";
// ...existing code...

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
  });

  const roleIcon = (role) => {
    switch (role) {
      case "admin":
        return <Shield className="w-4 h-4 text-purple-600" />;
      case "restaurant":
        return <Store className="w-4 h-4 text-orange-600" />;
      default:
        return <User className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">User Management</h1>
        <p className="text-muted-foreground">
          Manage all users including admins, restaurants, and customers
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 w-full border rounded px-3 py-2"
          />
        </div>
      </div>

      {loading ? (
        <div>Loading users...</div>
      ) : error ? (
        <div className="text-destructive">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((user) => (
            <div key={user._id || user.id} className="bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    {roleIcon(user.role)}
                    <div>
                      <div className="text-lg font-semibold">{user.name}</div>
                      <p className="text-xs text-muted-foreground mt-1">{user.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm font-medium">{user.phone || "-"}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground">Role</p>
                    <p
                      className={`text-sm font-semibold ${
                        user.role === "admin"
                          ? "text-purple-600"
                          : user.role === "restaurant"
                          ? "text-orange-600"
                          : "text-blue-600"
                      }`}
                    >
                      {user.role?.charAt(0).toUpperCase() + (user.role?.slice(1) || "")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <p
                      className={`text-sm font-semibold ${
                        user.status === "active" ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      {user.status?.charAt(0).toUpperCase() + (user.status?.slice(1) || "")}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Last Login</p>
                  <p className="text-sm">{user.lastLogin || "-"}</p>
                </div>

                <div className="flex gap-2 pt-2">
                  <button className="px-3 py-1 border rounded flex-1 bg-transparent flex items-center justify-center text-sm">
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </button>
                  <button className="px-3 py-1 border rounded text-sm">
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

