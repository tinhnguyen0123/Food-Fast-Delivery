// ...existing code...
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
// ...existing code...

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Đăng nhập thất bại');

      // ✅ Lưu token và thông tin người dùng
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user || data));

      toast.success(data.message || 'Đăng nhập thành công!');

      const user = data.user || data;

      // ✅ Phân hướng theo vai trò
      if (user?.role === 'admin') {
        navigate('/admin/orders', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      console.error('login error:', err);
      toast.error(err.message || 'Không thể đăng nhập!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-semibold mb-4 text-blue-600">Đăng nhập</h2>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md w-80">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="border p-2 w-full mb-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mật khẩu"
          required
          className="border p-2 w-full mb-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white py-2 w-full rounded hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>

      <p className="mt-4 text-gray-600">
        Chưa có tài khoản?{' '}
        <button
          onClick={() => navigate('/register')}
          className="text-blue-600 hover:underline font-semibold"
        >
          Đăng ký ngay
        </button>
      </p>
    </div>
  );
}
// ...existing code...
