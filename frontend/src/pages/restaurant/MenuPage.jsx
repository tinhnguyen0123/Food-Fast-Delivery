import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { 
  Search, Plus, Edit2, Trash2, Eye, EyeOff, X,
  ImageIcon, DollarSign, Package, Tag, RefreshCw,
  UtensilsCrossed, TrendingUp
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
    category: "Món chính",
    available: true,
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);

  const [categories, setCategories] = useState([
    "Món chính", "Món ăn vặt", "Món ăn sáng", "Món tráng miệng", "Thức uống"
  ]);
  const [catFilter, setCatFilter] = useState("all");

  const token = localStorage.getItem("token");

  // ...existing code (ensureRestaurantId, loadCategories, loadProducts)...

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
        toast.info("Tài khoản chưa có nhà hàng");
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

  const loadCategories = async (rid) => {
    try {
      const res = await fetch(`http://localhost:5000/api/product/restaurant/${rid}/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (Array.isArray(data) && data.length) setCategories(data);
    } catch {}
  };

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
      loadCategories(rid);
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

  const resetForm = () => {
    setEditing(null);
    setForm({
      name: "",
      description: "",
      price: "",
      category: "Món chính",
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
      category: p.category || "Món chính",
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
      toast.success(p.available ? " Đã tạm ẩn món" : " Đã hiện món");
    } catch (e) {
      console.error(e);
      toast.error(e.message || "Lỗi cập nhật trạng thái");
    }
  };

  const filtered = items.filter((i) => {
    const q = search.trim().toLowerCase();
    const byText =
      !q ||
      i.name?.toLowerCase().includes(q) ||
      i.category?.toLowerCase().includes(q) ||
      i.description?.toLowerCase().includes(q);
    const byCat = catFilter === "all" || (i.category || "").toLowerCase() === catFilter.toLowerCase();
    return byText && byCat;
  });

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
          <p className="text-gray-600 font-medium">Đang tải thực đơn...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <UtensilsCrossed className="w-7 h-7 text-orange-600" />
            Quản lý Thực đơn
          </h1>
          <p className="text-gray-600 mt-1">Thêm, sửa, ẩn/hiện món ăn của nhà hàng</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadProducts}
            className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200"
          >
            <RefreshCw className="w-4 h-4" />
            Tải lại
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 py-2 rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            Thêm món
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm mb-1">Tổng món</p>
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
              <p className="text-gray-100 text-sm mb-1">Đã tạm ẩn</p>
              <p className="text-3xl font-bold">{stats.hidden}</p>
            </div>
            <EyeOff className="w-12 h-12 text-white/30" />
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm món ăn..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            />
          </div>
          <select
            value={catFilter}
            onChange={e => setCatFilter(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium min-w-[200px]"
          >
            <option value="all">📋 Tất cả danh mục</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCatFilter("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all duration-200 ${
              catFilter === "all"
                ? "bg-orange-600 text-white border-orange-600"
                : "bg-white text-gray-700 border-gray-300 hover:border-orange-400"
            }`}
          >
            Tất cả
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCatFilter(c)}
              className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all duration-200 ${
                catFilter === c
                  ? "bg-orange-600 text-white border-orange-600"
                  : "bg-white text-gray-700 border-gray-300 hover:border-orange-400"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <UtensilsCrossed className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Không tìm thấy món ăn
          </h3>
          <p className="text-gray-600 mb-6">
            {search || catFilter !== "all" ? "Thử thay đổi bộ lọc" : "Hãy thêm món đầu tiên"}
          </p>
          {(search || catFilter !== "all") && (
            <button
              onClick={() => { setSearch(""); setCatFilter("all"); }}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map(item => (
            <div
              key={item._id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-1"
            >
              {/* Image */}
              <div className="relative h-48 bg-gray-200">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-16 h-16 text-gray-400" />
                  </div>
                )}
                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                  {item.available === false ? (
                    <span className="bg-gray-800/90 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <EyeOff className="w-3 h-3" />
                      Tạm ẩn
                    </span>
                  ) : (
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      Đang bán
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-bold text-lg text-gray-800 line-clamp-1">
                    {item.name}
                  </h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    {item.category}
                  </p>
                </div>

                {item.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {item.description}
                  </p>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-xl font-bold text-orange-600">
                    {Number(item.price || 0).toLocaleString("vi-VN")}₫
                  </span>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <button
                    onClick={() => openEdit(item)}
                    title="Sửa món"
                    className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                  >
                    <Edit2 className="w-4 h-4" />
                    Sửa
                  </button>
                  
                  <button
                    onClick={() => toggleAvailable(item)}
                    title={item.available === false ? "Hiện món" : "Tạm ẩn món (không hiển thị cho khách)"}
                    className={`flex items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                      item.available === false
                        ? "bg-green-50 text-green-600 hover:bg-green-100"
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {item.available === false ? (
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
                    onClick={() => deleteProduct(item._id)}
                    title="Xóa món"
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-orange-600 to-red-600 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <UtensilsCrossed className="w-6 h-6" />
                {editing ? "Sửa món ăn" : "Thêm món mới"}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tên món <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Vd: Phở bò tái"
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  placeholder="Mô tả ngắn về món ăn..."
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none transition-all"
                />
              </div>

              {/* Price & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Giá <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      placeholder="50000"
                      value={form.price}
                      onChange={e => setForm({...form, price: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Danh mục
                  </label>
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Available Toggle */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="available"
                  checked={form.available}
                  onChange={e => setForm({...form, available: e.target.checked})}
                  className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <label htmlFor="available" className="flex-1 cursor-pointer">
                  <span className="font-semibold text-gray-800">Hiển thị món này</span>
                  <p className="text-sm text-gray-600">
                    Khi tắt, món sẽ <b>tạm ẩn</b>: không xuất hiện với khách hàng và không thể thêm vào giỏ
                  </p>
                </label>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ảnh món ăn
                </label>
                <div className="flex flex-col items-center gap-4">
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="preview"
                      className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                    />
                  )}
                  <label className="w-full cursor-pointer">
                    <div className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all">
                      <ImageIcon className="w-5 h-5 text-gray-500" />
                      <span className="text-gray-600 font-medium">
                        {imagePreview ? "Thay đổi ảnh" : "Chọn ảnh"}
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={onChooseImage}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={saveProduct}
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                {editing ? (
                  <>
                    <Edit2 className="w-5 h-5" />
                    Cập nhật món
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Thêm món
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}