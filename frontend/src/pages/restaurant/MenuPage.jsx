import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff, 
  X,
  Image as ImageIcon,
  DollarSign,
  Package,
  Tag
} from "lucide-react";

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
  const [imagePreview, setImagePreview] = useState(null);

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
    setImagePreview(null);
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
    setImagePreview(p.image || null);
    setShowForm(true);
  };

  const onChooseImage = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      setForm((prev) => ({ ...prev, image: f }));
      setImagePreview(URL.createObjectURL(f));
    }
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
      fd.append("restaurantId", rid);
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

      toast.success(editing ? " Đã cập nhật món" : " Đã thêm món");
      setShowForm(false);
      resetForm();
      loadProducts();
    } catch (e) {
      console.error(e);
      toast.error(e.message || "Lỗi lưu món");
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa món này?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/product/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Xóa thất bại");
      toast.success(" Đã xóa món");
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
      toast.success(p.available ? "👁️ Đã ẩn món" : "✅ Đã hiện món");
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

  // Stats
  const stats = {
    total: items.length,
    available: items.filter(i => i.available !== false).length,
    hidden: items.filter(i => i.available === false).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-orange-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Đang tải thực đơn...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Thực đơn</h1>
          <p className="text-gray-600 mt-1">Thêm, chỉnh sửa và quản lý món ăn</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Thêm món mới
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm mb-1">Tổng số món</p>
              <p className="text-3xl font-bold">{stats.total}</p>
            </div>
            <Package className="w-12 h-12 text-white/30" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm mb-1">Đang bán</p>
              <p className="text-3xl font-bold">{stats.available}</p>
            </div>
            <Eye className="w-12 h-12 text-white/30" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-100 text-sm mb-1">Đã ẩn</p>
              <p className="text-3xl font-bold">{stats.hidden}</p>
            </div>
            <EyeOff className="w-12 h-12 text-white/30" />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="Tìm kiếm theo tên, danh mục hoặc mô tả..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Menu Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {search ? "Không tìm thấy món ăn" : "Chưa có món nào"}
          </h3>
          <p className="text-gray-600 mb-6">
            {search
              ? "Thử tìm kiếm với từ khóa khác"
              : "Bắt đầu thêm món ăn vào thực đơn của bạn"}
          </p>
          {!search && (
            <button
              onClick={openCreate}
              className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Thêm món đầu tiên
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((p) => (
            <div
              key={p._id}
              className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-200 ${
                p.available === false ? "opacity-60" : ""
              }`}
            >
              {/* Image */}
              <div className="relative h-48 bg-gradient-to-br from-orange-100 to-red-100">
                {p.image ? (
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-16 h-16 text-gray-300" />
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg ${
                      p.available === false
                        ? "bg-red-500 text-white"
                        : "bg-green-500 text-white"
                    }`}
                  >
                    {p.available === false ? (
                      <>
                        <EyeOff className="w-3 h-3" />
                        Đã ẩn
                      </>
                    ) : (
                      <>
                        <Eye className="w-3 h-3" />
                        Đang bán
                      </>
                    )}
                  </span>
                </div>

                {/* Category Badge */}
                {p.category && (
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/90 text-gray-700 shadow-lg">
                      <Tag className="w-3 h-3" />
                      {p.category}
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">
                  {p.name}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[40px]">
                  {p.description || "Chưa có mô tả"}
                </p>

                {/* Price */}
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <span className="text-2xl font-bold text-green-600">
                    {Intl.NumberFormat("vi-VN").format(p.price)}đ
                  </span>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => openEdit(p)}
                    className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                  >
                    <Edit2 className="w-4 h-4" />
                    Sửa
                  </button>
                  
                  <button
                    onClick={() => toggleAvailable(p)}
                    className={`flex items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                      p.available === false
                        ? "bg-green-50 text-green-600 hover:bg-green-100"
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {p.available === false ? (
                      <>
                        <Eye className="w-4 h-4" />
                        Hiện
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-4 h-4" />
                        Ẩn
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => deleteProduct(p._id)}
                    className="flex items-center justify-center gap-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-white">
                {editing ? "Cập nhật món ăn" : "Thêm món mới"}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Hình ảnh món ăn
                </label>
                <div className="relative">
                  {imagePreview ? (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-gray-200">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => {
                          setImagePreview(null);
                          setForm(p => ({ ...p, image: null }));
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">Click để chọn ảnh</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={onChooseImage}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tên món <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="VD: Burger phô mai"
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  placeholder="Mô tả ngắn về món ăn..."
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                />
              </div>

              {/* Price & Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Giá <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="50000"
                      value={form.price}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, price: e.target.value }))
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Danh mục
                  </label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="VD: Burger, Pizza, Đồ uống"
                      value={form.category}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, category: e.target.value }))
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Available Toggle */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="available"
                  checked={form.available}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, available: e.target.checked }))
                  }
                  className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <label htmlFor="available" className="flex-1 cursor-pointer">
                  <span className="font-semibold text-gray-800">Hiển thị món này</span>
                  <p className="text-sm text-gray-600">Khách hàng sẽ thấy món này trong thực đơn</p>
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-gray-50 flex gap-3">
              <button
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={saveProduct}
                className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
              >
                {editing ? "Cập nhật" : "Thêm món"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}