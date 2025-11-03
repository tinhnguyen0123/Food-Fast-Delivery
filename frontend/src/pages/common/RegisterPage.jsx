import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'customer'
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/user/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || 'Đăng ký thành công!', {
          position: "top-right",
          autoClose: 2000,
        });
        
        // ✅ ĐÃ SỬA: Thêm phone: '' vào đây
        setFormData({ name: '', email: '', password: '', phone: '', role: 'customer' });
        
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        toast.error(data.message || 'Đăng ký thất bại!', {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      toast.error('Không thể kết nối đến server!', {
        position: "top-right",
        autoClose: 3000,
      });
      console.error('Register error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-semibold mb-4 text-blue-600">Đăng ký</h2>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md w-80">
        <input 
          className="border p-2 w-full mb-3 rounded focus:outline-none focus:ring-2 focus:ring-green-500" 
          placeholder="Họ và tên"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input 
          className="border p-2 w-full mb-3 rounded focus:outline-none focus:ring-2 focus:ring-green-500" 
          placeholder="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input 
          type="password" 
          className="border p-2 w-full mb-3 rounded focus:outline-none focus:ring-2 focus:ring-green-500" 
          placeholder="Mật khẩu"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          minLength={3}
        />
        <input 
          className="border p-2 w-full mb-3 rounded focus:outline-none focus:ring-2 focus:ring-green-500" 
          placeholder="Số điện thoại"
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
        />
        <select
          className="border p-2 w-full mb-3 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          name="role"
          value={formData.role}
          onChange={handleChange}
        >
          <option value="customer">Khách hàng</option>
          <option value="restaurant">Nhà hàng</option>
        </select>

        <button 
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white py-2 w-full rounded hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Đang xử lý...
            </span>
          ) : (
            'Đăng ký'
          )}
        </button>
      </form>

      <p className="mt-4 text-gray-600">
        Đã có tài khoản?{' '}
        <button 
          onClick={() => navigate('/login')}
          className="text-blue-600 hover:underline font-semibold"
        >
          Đăng nhập ngay
        </button>
      </p>
    </div>
  );
}