// ...existing code...
import { useEffect, useState } from "react"
import { Search, Eye } from "lucide-react"

// ✅ Khai báo API base từ biến môi trường (hoặc mặc định localhost)
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000"

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    const token = localStorage.getItem("token")

    const fetchOrders = async () => {
      setLoading(true)
      setError(null)
      try {
        // ✅ Dùng API_BASE cho endpoint
        const res = await fetch(`${API_BASE}/api/order`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })

        if (!mounted) return

        if (res.status === 401) {
          setError("Unauthorized — please login again")
          setOrders([])
          return
        }

        if (!res.ok) {
          setOrders([])
          return
        }

        const data = await res.json()
        setOrders(Array.isArray(data) ? data : data.orders || [])
      } catch (err) {
        console.error("fetch orders", err)
        setError("Failed to load orders")
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchOrders()
    return () => {
      mounted = false
    }
  }, [])

  const filtered = orders.filter((o) => {
    const matchesSearch =
      !search ||
      (o.orderNumber && o.orderNumber.includes(search)) ||
      (o.customer && o.customer.toLowerCase().includes(search.toLowerCase()))
    const matchesFilter = filter === "all" || o.status === filter
    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">Order Management</h1>
        <p className="text-muted-foreground">View and manage all system orders</p>
      </div>

      {/* Thanh tìm kiếm và bộ lọc */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 w-full border rounded px-3 py-2"
            />
          </div>
          <div className="flex gap-2">
            {["all", "pending", "preparing", "ready", "delivering", "completed"].map((s) => (
              <button
                key={s}
                className={`px-3 py-1 rounded ${
                  filter === s ? "bg-blue-600 text-white" : "bg-white border"
                }`}
                onClick={() => setFilter(s)}
              >
                {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bảng hiển thị danh sách đơn hàng */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b">
          <div className="text-lg font-medium">Orders ({filtered.length})</div>
        </div>
        <div className="p-4">
          {loading ? (
            <div className="p-4">Loading orders...</div>
          ) : error ? (
            <div className="p-4 text-destructive">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="p-4">No orders found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-sm">Order ID</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Customer</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Restaurant</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Amount</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Drone</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((order) => (
                    <tr
                      key={order._id || order.id}
                      className="border-b border-border hover:bg-secondary/50"
                    >
                      <td className="py-3 px-4 font-medium text-sm">
                        {order.orderNumber || order._id}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {order.customer?.name || order.customer || "-"}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {order.restaurant?.name || order.restaurant || "-"}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-1 rounded bg-gray-100 text-sm">
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-sm">
                        ${order.total?.toLocaleString() || 0}
                      </td>
                      <td className="py-3 px-4 text-sm">{order.droneId || "-"}</td>
                      <td className="py-3 px-4 text-sm">
                        {order.date ||
                          new Date(order.createdAt || order.created)?.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <button className="px-2 py-1 rounded hover:bg-secondary/40">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
// ...existing code...
