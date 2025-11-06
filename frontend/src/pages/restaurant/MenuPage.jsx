import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function MenuPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [restaurantId, setRestaurantId] = useState(localStorage.getItem("myRestaurantId") || "");
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    available: true,
    image: null,
  });

  const token = localStorage.getItem("token");

  // ✅ Đảm bảo lấy đúng restaurantId của chủ nhà hàng
  const ensureRestaurantId = async () => {
    if (restaurantId) return restaurantId;
    const cached = localStorage.getItem("myRestaurantId");
    if (cached) {
      setRestaurantId(cached);
      return cached;
    }
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user?.id && !user?._id) throw new Error("Chưa đăng nhập");
      const res = await fetch(`http://localhost:5000/api/restaurant/owner/${user.id || user._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const list = await res.json();
      if (!res.ok) throw new Error(list.message || "Không lấy được nhà hàng của bạn");
      if (!Array.isArray(list) || list.length === 0) {
        toast.info("Tài khoản chưa có nhà hàng (chưa đăng ký hoặc chưa được duyệt).");
        return "";
      }
      const rid = list[0]._id;
      setRestaurantId(rid);
      localStorage.setItem("myRestaurantId", rid);
      return rid;
    } catch (e) {
      console.error(e);
      toast.error(e.message || "Lỗi lấy thông tin nhà hàng");
      return "";
    }
  };

  // ✅ Tải danh sách món ăn theo nhà hàng
  const loadProducts = async () => {
    setLoading(true);
    try {
      const rid = await ensureRestaurantId();
      if (!rid) {
        setItems([]);
        return;
      }
      const res = await fetch(`http://localhost:5000/api/product/restaurant/${rid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Tải menu thất bại");
      setItems(Array.isArray(data) ? data : data.items || []);
    } catch (e) {
      console.error(e);
      toast.error(e.message || "Lỗi tải menu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // ✅ Reset form
  const resetForm = () => {
    setEditing(null);
    setForm({
      name: "",
      description: "",
      price: "",
      category: "",
      available: true,
      image: null,
    });
  };

  const openCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name || "",
      description: p.description || "",
      price: p.price || "",
      category: p.category || "",
      available: p.available !== false,
      image: null,
    });
    setShowForm(true);
  };

  const onChooseImage = (e) => {
    const f = e.target.files?.[0];
    if (f) setForm((prev) => ({ ...prev, image: f }));
  };

  // ✅ Lưu hoặc cập nhật sản phẩm
  const saveProduct = async () => {
    try {
      if (!form.name || !form.price) {
        toast.error("Tên và giá là bắt buộc");
        return;
      }
      const rid = restaurantId || (await ensureRestaurantId());
      if (!rid) {
        toast.error("Chưa xác định được nhà hàng");
        return;
      }

      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("description", form.description);
      fd.append("price", form.price);
      fd.append("category", form.category);
      fd.append("available", String(form.available));
      fd.append("restaurantId", rid); // ✅ Bắt buộc phải có
      if (form.image) {
        fd.append("image", form.image);
        fd.append("file", form.image);
      }
      let url = "http://localhost:5000/api/product";
      let method = "POST";
      if (editing?._id) {
        url = `http://localhost:5000/api/product/${editing._id}`;
        method = "PUT";
      }

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Lưu sản phẩm thất bại");

      toast.success(editing ? "Đã cập nhật món" : "Đã thêm món");
      setShowForm(false);
      resetForm();
      loadProducts();
    } catch (e) {
      console.error(e);
      toast.error(e.message || "Lỗi lưu món");
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Xóa món này?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/product/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Xóa thất bại");
      toast.success("Đã xóa");
      loadProducts();
    } catch (e) {
      console.error(e);
      toast.error(e.message || "Lỗi xóa món");
    }
  };

  const toggleAvailable = async (p) => {
    try {
      const res = await fetch(`http://localhost:5000/api/product/${p._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ available: !p.available }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Cập nhật trạng thái thất bại");
      setItems((prev) =>
        prev.map((x) =>
          x._id === p._id ? { ...x, available: !x.available } : x
        )
      );
    } catch (e) {
      console.error(e);
      toast.error(e.message || "Lỗi cập nhật trạng thái");
    }
  };

  const filtered = items.filter((i) => {
    const q = search.trim().toLowerCase();
    return (
      !q ||
      i.name?.toLowerCase().includes(q) ||
      i.category?.toLowerCase().includes(q) ||
      i.description?.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-semibold">Quản lý Menu</h1>
          <p className="text-gray-500 text-sm">Thêm, sửa, ẩn/hiện món</p>
        </div>
        <div className="flex gap-2">
          <input
            className="border rounded px-3 py-2"
            placeholder="Tìm theo tên, danh mục..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            onClick={openCreate}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Thêm món
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Đang tải...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10 text-gray-500">Chưa có món nào</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <div
              key={p._id}
              className={`border rounded p-4 ${
                p.available === false ? "opacity-60" : ""
              }`}
            >
              <div className="flex justify-between items-start gap-3">
                <div>
                  <h3 className="font-semibold">{p.name}</h3>
                  <p className="text-xs text-gray-500">{p.category}</p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    p.available === false
                      ? "bg-red-100 text-red-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {p.available === false ? "Ẩn" : "Đang bán"}
                </span>
              </div>
              {p.image && (
                <img
                  src={p.image}
                  alt={p.name}
                  className="mt-2 w-full h-40 object-cover rounded border"
                />
              )}
              <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                {p.description}
              </p>
              <div className="flex justify-between items-center mt-3">
                <span className="text-lg font-bold text-blue-700">
                  {Intl.NumberFormat("vi-VN").format(p.price)} đ
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(p)}
                    className="px-3 py-1 border rounded hover:bg-gray-50"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => deleteProduct(p._id)}
                    className="px-3 py-1 border rounded hover:bg-gray-50"
                  >
                    Xóa
                  </button>
                </div>
              </div>
              <button
                onClick={() => toggleAvailable(p)}
                className="mt-2 w-full px-3 py-2 rounded border hover:bg-gray-50"
              >
                {p.available === false ? "Mở bán" : "Tạm ẩn"}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ✅ Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg rounded p-5 shadow">
            <h3 className="text-lg font-semibold mb-3">
              {editing ? "Cập nhật món" : "Thêm món mới"}
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <input
                className="border rounded px-3 py-2"
                placeholder="Tên món"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
              />
              <textarea
                rows={3}
                className="border rounded px-3 py-2"
                placeholder="Mô tả"
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
              />
              <input
                type="number"
                className="border rounded px-3 py-2"
                placeholder="Giá (đ)"
                value={form.price}
                onChange={(e) =>
                  setForm((p) => ({ ...p, price: e.target.value }))
                }
              />
              <input
                className="border rounded px-3 py-2"
                placeholder="Danh mục (VD: Burger, Pizza)"
                value={form.category}
                onChange={(e) =>
                  setForm((p) => ({ ...p, category: e.target.value }))
                }
              />
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.available}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, available: e.target.checked }))
                  }
                />
                Đang bán
              </label>
              <div>
                <label className="text-sm block mb-1">Ảnh sản phẩm</label>
                <input type="file" accept="image/*" onChange={onChooseImage} />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={saveProduct}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
