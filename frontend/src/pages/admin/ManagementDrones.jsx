// ...existing code...
import { useEffect, useState } from "react"
import { Search, Zap, Gauge, Weight, MapPin, Edit2 } from "lucide-react"

// ✅ Khai báo API base từ biến môi trường (hoặc mặc định localhost)
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000"

export default function DronesPage() {
  const [drones, setDrones] = useState([])
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    const token = localStorage.getItem("token")

    const fetchDrones = async () => {
      setLoading(true)
      try {
        // ✅ Dùng API_BASE
        const res = await fetch(`${API_BASE}/api/drone`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })
        if (!mounted) return
        if (!res.ok) {
          setDrones([])
          return
        }
        const data = await res.json()
        setDrones(Array.isArray(data) ? data : data.drones || [])
      } catch (err) {
        console.error("fetch drones", err)
        setError("Failed to load drones")
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchDrones()
    return () => {
      mounted = false
    }
  }, [])

  const statusConfig = {
    active: "bg-green-100 text-green-800",
    idle: "bg-blue-100 text-blue-800",
    maintenance: "bg-yellow-100 text-yellow-800",
    offline: "bg-red-100 text-red-800",
  }

  const filtered = drones.filter((d) => {
    const matchesSearch =
      !search ||
      (d.droneId && d.droneId.toUpperCase().includes(search.toUpperCase()))
    const matchesFilter = filter === "all" || d.status === filter
    return matchesSearch && matchesFilter
  })

  const sample = [
    {
      id: "1",
      droneId: "DRONE-001",
      status: "active",
      battery: 85,
      load: 3.2,
      maxLoad: 5,
      currentOrder: "ORD-001",
      location: "District 1, HCMC",
      lastUpdated: "2 mins ago",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">Drone Management</h1>
        <p className="text-muted-foreground">
          Monitor and manage delivery drones
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Search drones..."
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
                filter === "active"
                  ? "bg-blue-600 text-white"
                  : "bg-white border"
              }`}
              onClick={() => setFilter("active")}
            >
              Active
            </button>
            <button
              className={`px-3 py-1 rounded ${
                filter === "idle" ? "bg-blue-600 text-white" : "bg-white border"
              }`}
              onClick={() => setFilter("idle")}
            >
              Idle
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(filtered.length ? filtered : sample).map((drone) => (
          <div key={drone._id || drone.id} className="bg-white rounded-lg shadow">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="text-lg font-semibold">{drone.droneId}</div>
              <span
                className={`text-sm px-2 py-1 rounded ${
                  statusConfig[drone.status] || ""
                }`}
              >
                {drone.status}
              </span>
            </div>

            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      Battery
                    </span>
                    <span className="text-sm font-bold">
                      {drone.battery ?? 0}%
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        drone.battery > 50 ? "bg-green-600" : "bg-yellow-600"
                      }`}
                      style={{ width: `${drone.battery ?? 0}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Weight className="w-3 h-3" />
                      Load
                    </span>
                    <span className="text-sm font-bold">
                      {drone.load ?? 0}/{drone.maxLoad ?? 0}kg
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${
                          ((drone.load ?? 0) / (drone.maxLoad || 1)) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-border space-y-2">
                {drone.currentOrder && (
                  <div>
                    <p className="text-xs text-muted-foreground">Current Order</p>
                    <p className="text-sm font-medium">{drone.currentOrder}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Location
                  </p>
                  <p className="text-sm font-medium">{drone.location}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Last Updated</p>
                  <p className="text-sm text-muted-foreground">
                    {drone.lastUpdated}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button className="px-3 py-1 border rounded flex-1 bg-transparent flex items-center justify-center text-sm">
                  <Gauge className="w-4 h-4 mr-1" />
                  Details
                </button>
                <button className="px-3 py-1 border rounded text-sm">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
// ...existing code...
