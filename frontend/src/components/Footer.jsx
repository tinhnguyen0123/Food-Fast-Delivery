import { Truck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              🚁 Drone Delivery
            </h3>
            <p className="text-gray-400">
              Giao hàng tương lai, đến với bạn hôm nay.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Về chúng tôi</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition">Giới thiệu</a></li>
              <li><a href="#" className="hover:text-white transition">Liên hệ</a></li>
              <li><a href="#" className="hover:text-white transition">Tuyển dụng</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Dịch vụ</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition">Đặt món</a></li>
              <li><a href="#" className="hover:text-white transition">Đăng ký nhà hàng</a></li>
              <li><a href="#" className="hover:text-white transition">Hỗ trợ</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Theo dõi</h4>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition">F</a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-pink-600 transition">I</a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-400 transition">T</a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
          © 2025 Drone Delivery. All rights reserved.
        </div>
      </div>
    </footer>
  );
}