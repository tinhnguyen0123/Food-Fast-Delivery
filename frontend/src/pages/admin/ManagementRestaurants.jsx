// ...existing code...
import { useEffect, useState } from "react"
import { Search, Eye, Edit2, Trash2, CheckCircle, Clock, AlertCircle } from "lucide-react"

// ✅ Khai báo API base từ biến môi trường (hoặc mặc định localhost)
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000"

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState([])
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    const token = localStorage.getItem("token")

    const fetchRests = async () => {
      setLoading(true)
      try {
        // ✅ Dùng API_BASE
        const res = await fetch(`${API_BASE}/api/restaurant`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })
        if (!mounted) return

        if (!res.ok) {
          setRestaurants([])
          return
        }

        const data = await res.json()
        setRestaurants(Array.isArray(data) ? data : data.restaurants || [])
      } catch (err) {
        console.error("fetch restaurants", err)
        setError("Failed to load restaurants")
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchRests()
    return () => {
      mounted = false
    }
  }, [])

  const statusConfig = {
    verified: { color: "bg-green-100 text-green-800", icon: CheckCircle },
    pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
    suspended: { color: "bg-red-100 text-red-800", icon: AlertCircle },
  }

  const filtered = restaurants.filter((r) => {
    const matchesSearch = !search || r.name?.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === "all" || r.status === filter
    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">Restaurant Management</h1>
        <p className="text-muted-foreground">Manage all restaurants in the system</p>
      </div>

      {/* Thanh tìm kiếm và lọc */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Search restaurants..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 w-full border rounded px-3 py-2"
            />
          </div>
          <div className="flex gap-2">
            <button
              className={`px-3 py-1 rounded ${
                filter === "all" ? "bg-blue-600 text-white" : "bg-white border"
              }`}
              onClick={() => setFilter("all")}
            >
              All
            </button>
            <button
              className={`px-3 py-1 rounded ${
                filter === "verified" ? "bg-blue-600 text-white" : "bg-white border"
              }`}
              onClick={() => setFilter("verified")}
            >
              Verified
            </button>
            <button
              className={`px-3 py-1 rounded ${
                filter === "pending" ? "bg-blue-600 text-white" : "bg-white border"
              }`}
              onClick={() => setFilter("pending")}
            >
              Pending
            </button>
          </div>
        </div>
      </div>

      {/* Bảng hiển thị danh sách */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b">
          <div className="text-lg font-medium">Restaurants ({filtered.length})</div>
        </div>
        <div className="p-4">
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div className="text-destructive">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-sm">Restaurant</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Orders</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Revenue</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Join Date</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((restaurant) => {
                    const statusCfg = statusConfig[restaurant.status] || statusConfig.pending
                    const Icon = statusCfg.icon
                    return (
                      <tr
                        key={restaurant._id || restaurant.id}
                        className="border-b border-border hover:bg-secondary/50"
                      >
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-sm">{restaurant.name}</p>
                            <p className="text-xs text-muted-foreground">{restaurant.email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-2 px-2 py-1 text-sm rounded ${statusCfg.color}`}
                          >
                            <Icon className="w-4 h-4" />
                            {restaurant.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm">{restaurant.orders ?? 0}</td>
                        <td className="py-3 px-4 text-sm font-medium">
                          ${(restaurant.revenue ?? 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {restaurant.joinDate ||
                            restaurant.createdAt?.slice(0, 10) ||
                            "-"}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <button className="px-2 py-1 rounded hover:bg-secondary/40">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="px-2 py-1 rounded hover:bg-secondary/40">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button className="px-2 py-1 rounded text-destructive hover:bg-secondary/40">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
