import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [restaurant, setRestaurant] = useState({
    name: "",
    description: "",
    phone: "",
    address: "",
    minOrder: "",
    deliveryFee: "",
    maxDeliveryDistance: "",
    image: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [rid, setRid] = useState(localStorage.getItem("myRestaurantId") || "");

  const token = localStorage.getItem("token");

  // ✅ Hàm lấy hoặc lưu lại ID nhà hàng
  const ensureRestaurantId = async () => {
    if (rid) return rid;
    const cached = localStorage.getItem("myRestaurantId");
    if (cached) {
      setRid(cached);
      return cached;
    }
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const res = await fetch(
        `http://localhost:5000/api/restaurant/owner/${user.id || user._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const list = await res.json();
      if (!res.ok || !Array.isArray(list) || list.length === 0) {
        toast.info("Tài khoản này chưa có nhà hàng nào");
        return "";
      }
      const id = list[0]._id;
      localStorage.setItem("myRestaurantId", id);
      setRid(id);
      return id;
    } catch {
      return "";
    }
  };

  // ✅ Hàm tải hồ sơ nhà hàng
  const loadProfile = async () => {
    setLoading(true);
    try {
      const id = await ensureRestaurantId();
      if (!id) {
        setRestaurant((p) => ({ ...p, _id: "" }));
        return;
      }

      const res = await fetch(`http://localhost:5000/api/restaurant/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Tải hồ sơ thất bại");

      setRestaurant({
        name: data.name || "",
        description: data.description || "",
        phone: data.phone || "",
        address: data.address || "",
        minOrder: data.minOrder || "",
        deliveryFee: data.deliveryFee || "",
        maxDeliveryDistance: data.maxDeliveryDistance || "",
        image: data.image || "",
        _id: data._id,
      });
    } catch (e) {
      console.error(e);
      toast.error(e.message || "Lỗi tải hồ sơ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // ✅ Hàm lưu thay đổi
  const onSave = async () => {
    if (!restaurant._id) {
      toast.info("Chưa có hồ sơ nhà hàng để lưu");
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", restaurant.name);
      fd.append("description", restaurant.description);
      fd.append("phone", restaurant.phone);
      fd.append("address", restaurant.address);
      fd.append("minOrder", restaurant.minOrder);
      fd.append("deliveryFee", restaurant.deliveryFee);
      fd.append("maxDeliveryDistance", restaurant.maxDeliveryDistance);
      if (imageFile) fd.append("image", imageFile);

      const res = await fetch(
        `http://localhost:5000/api/restaurant/${restaurant._id}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Lưu thất bại");

      toast.success("Đã lưu thay đổi");
      loadProfile();
    } catch (e) {
      console.error(e);
      toast.error(e.message || "Lỗi lưu hồ sơ");
    } finally {
      setSaving(false);
    }
  };

  // ✅ Giao diện
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-semibold">Hồ sơ nhà hàng</h1>
          <p className="text-gray-500 text-sm">
            Cập nhật thông tin hiển thị cho khách hàng
          </p>
        </div>
        <button
          disabled={saving}
          onClick={onSave}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400"
        >
          {saving ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Đang tải...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Thông tin cơ bản */}
          <div className="border rounded p-4">
            <h3 className="font-semibold mb-3">Thông tin cơ bản</h3>
            <div className="space-y-3">
              <input
                className="border rounded px-3 py-2 w-full"
                placeholder="Tên nhà hàng"
                value={restaurant.name}
                onChange={(e) =>
                  setRestaurant((p) => ({ ...p, name: e.target.value }))
                }
              />
              <textarea
                rows={3}
                className="border rounded px-3 py-2 w-full"
                placeholder="Mô tả"
                value={restaurant.description}
                onChange={(e) =>
                  setRestaurant((p) => ({ ...p, description: e.target.value }))
                }
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  className="border rounded px-3 py-2 w-full"
                  placeholder="Số điện thoại"
                  value={restaurant.phone}
                  onChange={(e) =>
                    setRestaurant((p) => ({ ...p, phone: e.target.value }))
                  }
                />
                <input
                  className="border rounded px-3 py-2 w-full"
                  placeholder="Địa chỉ"
                  value={restaurant.address}
                  onChange={(e) =>
                    setRestaurant((p) => ({ ...p, address: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>

          {/* Cấu hình giao hàng */}
          <div className="border rounded p-4">
            <h3 className="font-semibold mb-3">Cấu hình giao hàng</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-sm text-gray-600">Đơn tối thiểu</label>
                <input
                  type="number"
                  className="border rounded px-3 py-2 w-full"
                  value={restaurant.minOrder}
                  onChange={(e) =>
                    setRestaurant((p) => ({
                      ...p,
                      minOrder: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Phí giao</label>
                <input
                  type="number"
                  className="border rounded px-3 py-2 w-full"
                  value={restaurant.deliveryFee}
                  onChange={(e) =>
                    setRestaurant((p) => ({
                      ...p,
                      deliveryFee: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">
                  Bán kính tối đa (km)
                </label>
                <input
                  type="number"
                  className="border rounded px-3 py-2 w-full"
                  value={restaurant.maxDeliveryDistance}
                  onChange={(e) =>
                    setRestaurant((p) => ({
                      ...p,
                      maxDeliveryDistance: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="text-sm text-gray-600 block mb-1">
                Ảnh đại diện
              </label>
              {restaurant.image && (
                <img
                  src={restaurant.image}
                  alt="restaurant"
                  className="w-32 h-32 object-cover rounded border mb-2"
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setImageFile(e.target.files?.[0] || null)
                }
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
