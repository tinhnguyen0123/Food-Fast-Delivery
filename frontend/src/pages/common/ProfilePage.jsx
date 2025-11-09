import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Shield, 
  Edit2, 
  Save, 
  X, 
  Lock, 
  Eye, 
  EyeOff,
  ArrowLeft 
} from 'lucide-react';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  });

  // State đổi mật khẩu
  const [pwd, setPwd] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [showPwdForm, setShowPwdForm] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const getRoleBadge = (role) => {
    const badges = {
      admin: { color: 'bg-red-100 text-red-700 border-red-200', text: 'Quản trị viên', icon: '👑' },
      restaurant: { color: 'bg-green-100 text-green-700 border-green-200', text: 'Nhà hàng', icon: '🏪' },
      customer: { color: 'bg-blue-100 text-blue-700 border-blue-200', text: 'Khách hàng', icon: '👤' }
    };
    return badges[role] || badges.customer;
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  const roleBadge = getRoleBadge(user?.role);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Quay lại trang chủ</span>
          </button>
          
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Thông tin tài khoản
          </h1>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          {/* Header với gradient */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
            <div className="flex items-center gap-4 text-white">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <User className="w-10 h-10" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{user?.name}</h2>
                <p className="text-white/80">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-6">
            {!isEditing ? (
              <>
                {/* Thông tin cá nhân */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <User className="w-5 h-5 text-blue-600 mt-1" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-1">Họ và tên</p>
                      <p className="font-semibold text-gray-800">{user?.name}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <Mail className="w-5 h-5 text-blue-600 mt-1" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-1">Email</p>
                      <p className="font-semibold text-gray-800">{user?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <Phone className="w-5 h-5 text-blue-600 mt-1" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-1">Số điện thoại</p>
                      <p className="font-semibold text-gray-800">
                        {user?.phone || <span className="text-gray-400 italic">Chưa cập nhật</span>}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <Shield className="w-5 h-5 text-blue-600 mt-1" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-1">Vai trò</p>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold border-2 ${roleBadge.color}`}>
                        <span>{roleBadge.icon}</span>
                        {roleBadge.text}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg md:col-span-2">
                    <Calendar className="w-5 h-5 text-blue-600 mt-1" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-1">Ngày tạo tài khoản</p>
                      <p className="font-semibold text-gray-800">
                        {new Date(user?.createdAt).toLocaleDateString('vi-VN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 group"
                  >
                    <Edit2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold">Chỉnh sửa thông tin</span>
                  </button>
                  
                  <button
                    onClick={() => setShowPwdForm((v) => !v)}
                    className="bg-gray-800 text-white px-6 py-3 rounded-xl hover:bg-black transition-all duration-200 flex items-center justify-center gap-2 group"
                  >
                    <Lock className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold">
                      {showPwdForm ? 'Đóng đổi mật khẩu' : 'Đổi mật khẩu'}
                    </span>
                  </button>
                </div>
              </>
            ) : (
              <form onSubmit={handleUpdate}>
                <div className="space-y-6">
                  {/* Name Input */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Họ và tên
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Email Input (Disabled) */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email (không thể thay đổi)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        value={user?.email}
                        disabled
                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-gray-100 text-gray-500 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Phone Input */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Số điện thoại
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Nhập số điện thoại"
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                          <span>Đang lưu...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          <span className="font-semibold">Lưu thay đổi</span>
                        </>
                      )}
                    </button>
                    
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-400 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <X className="w-5 h-5" />
                      <span className="font-semibold">Hủy</span>
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Change Password Form */}
        {showPwdForm && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <Lock className="w-6 h-6" />
                  <h3 className="text-xl font-semibold">Đổi mật khẩu</h3>
                </div>
                <button
                  type="button"
                  onClick={() => { setShowPwdForm(false); setPwd({ oldPassword:'', newPassword:'', confirmPassword:'' }); }}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <form onSubmit={handleChangePassword} className="space-y-6">
                {/* Old Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mật khẩu hiện tại
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showOldPassword ? 'text' : 'password'}
                      value={pwd.oldPassword}
                      onChange={(e) => setPwd({ ...pwd, oldPassword: e.target.value })}
                      placeholder="Nhập mật khẩu hiện tại"
                      required
                      className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showOldPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mật khẩu mới
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={pwd.newPassword}
                      onChange={(e) => setPwd({ ...pwd, newPassword: e.target.value })}
                      placeholder="Nhập mật khẩu mới (tối thiểu 3 ký tự)"
                      required
                      minLength={3}
                      className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Xác nhận mật khẩu mới
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={pwd.confirmPassword}
                      onChange={(e) => setPwd({ ...pwd, confirmPassword: e.target.value })}
                      placeholder="Nhập lại mật khẩu mới"
                      required
                      minLength={3}
                      className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={pwLoading}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {pwLoading ? (
                      <>
                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                        <span>Đang đổi mật khẩu...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5" />
                        <span className="font-semibold">Đổi mật khẩu</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => { setShowPwdForm(false); setPwd({ oldPassword:'', newPassword:'', confirmPassword:'' }); }}
                    className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-300 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <X className="w-5 h-5" />
                    <span className="font-semibold">Hủy</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}