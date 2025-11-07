// ...existing code...
import { useEffect, useState } from "react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { TrendingUp, ShoppingCart, Percent } from "lucide-react"

// ✅ Khai báo API base từ biến môi trường (hoặc mặc định localhost)
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000"

export default function AnalyticsPage() {
  const [revenueData, setRevenueData] = useState([
    { date: "Nov 1", revenue: 4000, orders: 240, expenses: 2400 },
    { date: "Nov 2", revenue: 3000, orders: 221, expenses: 2210 },
    { date: "Nov 3", revenue: 2000, orders: 229, expenses: 2290 },
    { date: "Nov 4", revenue: 2780, orders: 200, expenses: 2000 },
    { date: "Nov 5", revenue: 1890, orders: 229, expenses: 2181 },
    { date: "Nov 6", revenue: 2390, orders: 200, expenses: 2500 },
  ])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const token = localStorage.getItem("token")

    const fetchAnalytics = async () => {
      setLoading(true)
      try {
        // ✅ Dùng API_BASE trong fetch
        const res = await fetch(`${API_BASE}/api/admin/analytics`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })
        if (!mounted) return

        if (res.ok) {
          const data = await res.json()
          // Expect shape { revenueData: [], metrics: {} } — fallback if backend not implemented
          if (data?.revenueData) setRevenueData(data.revenueData)
        }
      } catch (e) {
        console.error("fetch analytics", e)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchAnalytics()
    return () => {
      mounted = false
    }
  }, [])

  const metrics = [
    { label: "Total Revenue (30d)", value: "$125,480", change: "+18%", icon: TrendingUp },
    { label: "Total Orders (30d)", value: "4,583", change: "+12%", icon: ShoppingCart },
    { label: "Avg Order Value", value: "$27.43", change: "-3%", icon: ShoppingCart },
    { label: "Commission Rate", value: "15%", change: "Stable", icon: Percent },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">System Analytics</h1>
        <p className="text-muted-foreground">Revenue and performance metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <div key={metric.label} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between pb-2">
                <div className="text-sm font-medium">{metric.label}</div>
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className="text-xs text-green-600 mt-1">{metric.change}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b">
          <div className="text-lg font-medium">Revenue vs Orders</div>
        </div>
        <div className="p-4">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="hsl(var(--chart-1))" name="Revenue" strokeWidth={2} />
              <Line type="monotone" dataKey="orders" stroke="hsl(var(--chart-2))" name="Orders" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b">
          <div className="text-lg font-medium">Operating Expenses vs Revenue</div>
        </div>
        <div className="p-4">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }} />
              <Legend />
              <Bar dataKey="revenue" fill="hsl(var(--chart-1))" name="Revenue" />
              <Bar dataKey="expenses" fill="hsl(var(--chart-3))" name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

