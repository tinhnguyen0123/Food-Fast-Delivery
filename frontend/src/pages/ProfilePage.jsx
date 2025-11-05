import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  });

  // 🔹 State đổi mật khẩu
  const [pwd, setPwd] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [showPwdForm, setShowPwdForm] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/user/current', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data);
        setFormData({
          name: data.name,
          phone: data.phone || '',
        });
      } else {
        toast.error('Không thể tải thông tin tài khoản');
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        }
      }
    } catch (error) {
      toast.error('Lỗi kết nối server');
      console.error('Fetch profile error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/user/${user._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Cập nhật thông tin thành công!');
        setUser(data);
        setIsEditing(false);

        const storedUser = JSON.parse(localStorage.getItem('user'));
        localStorage.setItem('user', JSON.stringify({
          ...storedUser,
          name: data.name,
          phone: data.phone
        }));
      } else {
        toast.error(data.message || 'Cập nhật thất bại');
      }
    } catch (error) {
      toast.error('Lỗi kết nối server');
      console.error('Update error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name,
      phone: user.phone || '',
    });
    setIsEditing(false);
  };

  // 🔹 Hàm đổi mật khẩu
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!pwd.oldPassword || !pwd.newPassword) {
      toast.error('Vui lòng nhập đầy đủ mật khẩu cũ và mới');
      return;
    }
    if (pwd.newPassword.length < 3) {
      toast.error('Mật khẩu mới phải từ 3 ký tự');
      return;
    }
    if (pwd.newPassword !== pwd.confirmPassword) {
      toast.error('Xác nhận mật khẩu không khớp');
      return;
    }

    setPwLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          oldPassword: pwd.oldPassword,
          newPassword: pwd.newPassword,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'Đổi mật khẩu thành công');
        setPwd({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setShowPwdForm(false);
      } else {
        if (res.status === 401) {
          toast.error('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        } else {
          toast.error(data.message || 'Đổi mật khẩu thất bại');
        }
      }
    } catch (err) {
      console.error('Change password error:', err);
      toast.error('Lỗi kết nối server');
    } finally {
      setPwLoading(false);
    }
  };

  if (loading && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Thông tin tài khoản</h2>
        <button
          onClick={() => navigate('/')}
          className="text-blue-600 hover:underline"
        >
          ← Quay lại
        </button>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md">
        {!isEditing ? (
          <>
            <div className="mb-6">
              <label className="text-sm text-gray-500 uppercase tracking-wide">Họ và tên</label>
              <p className="text-xl font-semibold text-gray-800 mt-1">{user?.name}</p>
            </div>
            <div className="mb-6">
              <label className="text-sm text-gray-500 uppercase tracking-wide">Email</label>
              <p className="text-xl font-semibold text-gray-800 mt-1">{user?.email}</p>
            </div>
            <div className="mb-6">
              <label className="text-sm text-gray-500 uppercase tracking-wide">Số điện thoại</label>
              <p className="text-xl font-semibold text-gray-800 mt-1">
                {user?.phone || <span className="text-gray-400 italic">Chưa cập nhật</span>}
              </p>
            </div>
            <div className="mb-6">
              <label className="text-sm text-gray-500 uppercase tracking-wide">Vai trò</label>
              <p className="text-xl font-semibold text-gray-800 mt-1">
                <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                  user?.role === 'admin' ? 'bg-red-100 text-red-700' :
                  user?.role === 'restaurant' ? 'bg-green-100 text-green-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {user?.role === 'admin' ? 'Quản trị viên' :
                   user?.role === 'restaurant' ? 'Nhà hàng' : 'Khách hàng'}
                </span>
              </p>
            </div>
            <div className="mb-6">
              <label className="text-sm text-gray-500 uppercase tracking-wide">Ngày tạo tài khoản</label>
              <p className="text-xl font-semibold text-gray-800 mt-1">
                {new Date(user?.createdAt).toLocaleDateString('vi-VN')}
              </p>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition w-full mb-3"
            >
              ✏️ Chỉnh sửa thông tin
            </button>
            <button
              onClick={() => setShowPwdForm((v) => !v)}
              className="bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-black transition w-full"
            >
              🔒 {showPwdForm ? 'Đóng đổi mật khẩu' : 'Đổi mật khẩu'}
            </button>
          </>
        ) : (
          <form onSubmit={handleUpdate}>
            <div className="mb-6">
              <label className="block text-sm text-gray-700 font-semibold mb-2">Họ và tên</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm text-gray-700 font-semibold mb-2">Email (không thể thay đổi)</label>
              <input
                type="email"
                value={user?.email}
                disabled
                className="border border-gray-200 p-3 w-full rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm text-gray-700 font-semibold mb-2">Số điện thoại</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập số điện thoại"
              />
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition flex-1 disabled:bg-gray-400"
              >
                {loading ? 'Đang lưu...' : '✓ Lưu thay đổi'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition flex-1"
              >
                ✕ Hủy
              </button>
            </div>
          </form>
        )}
      </div>

      {showPwdForm && (
        <div className="bg-white p-8 rounded-lg shadow-md mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Đổi mật khẩu</h3>
            <button
              type="button"
              onClick={() => { setShowPwdForm(false); setPwd({ oldPassword:'', newPassword:'', confirmPassword:'' }); }}
              className="text-sm text-gray-600 hover:underline"
            >
              Hủy
            </button>
          </div>
          <form onSubmit={handleChangePassword} className="grid gap-4">
            <div>
              <label className="block text-sm text-gray-700 font-semibold mb-2">Mật khẩu hiện tại</label>
              <input
                type="password"
                value={pwd.oldPassword}
                onChange={(e) => setPwd({ ...pwd, oldPassword: e.target.value })}
                className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập mật khẩu hiện tại"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 font-semibold mb-2">Mật khẩu mới</label>
              <input
                type="password"
                value={pwd.newPassword}
                onChange={(e) => setPwd({ ...pwd, newPassword: e.target.value })}
                className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập mật khẩu mới"
                required
                minLength={3}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 font-semibold mb-2">Xác nhận mật khẩu mới</label>
              <input
                type="password"
                value={pwd.confirmPassword}
                onChange={(e) => setPwd({ ...pwd, confirmPassword: e.target.value })}
                className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập lại mật khẩu mới"
                required
                minLength={3}
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={pwLoading}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
              >
                {pwLoading ? 'Đang đổi mật khẩu...' : 'Đổi mật khẩu'}
              </button>
              <button
                type="button"
                onClick={() => { setShowPwdForm(false); setPwd({ oldPassword:'', newPassword:'', confirmPassword:'' }); }}
                className="bg-gray-200 px-6 py-3 rounded-lg hover:bg-gray-300 transition"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
