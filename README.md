# Food Fast Delivery 

Ứng dụng giao đồ ăn hiện đại sử dụng công nghệ drone, hỗ trợ đầy đủ tính năng quản lý đơn hàng, thực đơn, drone và thống kê doanh thu cho 3 vai trò: Khách hàng, Nhà hàng và Admin.

# 📋 Mục lục

✨ Tính năng chính
🏗️ Kiến trúc hệ thống
🛠️ Công nghệ sử dụng
📁 Cấu trúc thư mục
⚙️ Cài đặt & Chạy
🔐 Cấu hình môi trường
📱 Các trang chính
🔄 Luồng nghiệp vụ
📡 API Endpoints
🎨 Giao diện
🚀 Tính năng nổi bật
🧪 Testing
📈 Roadmap
🤝 Đóng góp
📄 License

# ✨ Tính năng chính

👤 Khách hàng
✅ Duyệt & Tìm kiếm sản phẩm

Xem danh sách món ăn theo danh mục/nhà hàng
Tìm kiếm món ăn theo tên
Phân trang client-side (10/20/50/100 món/trang)
Lọc theo giá, đánh giá, khoảng cách
🛒 Giỏ hàng thông minh

Thêm/xóa/cập nhật số lượng món
Tự động gộp món từ cùng nhà hàng
Tính toán phí giao hàng tự động
Lưu giỏ hàng giữa các phiên
📦 Quản lý đơn hàng

Xem lịch sử đơn hàng
Theo dõi trạng thái realtime
Nhận thông báo khi drone đến nơi
Xác nhận đã nhận hàng
Đánh giá đơn hàng
💳 Thanh toán linh hoạt

COD (Thanh toán khi nhận hàng)
MoMo Wallet
Chọn địa chỉ giao hàng trên bản đồ
Tìm kiếm địa chỉ tự động (Nominatim API)
🔔 Thông báo realtime

Drone đã nhận đơn và đang bay đến
Đơn hàng đã đến nơi (sau 10s tự động nhắc)
Trạng thái đơn hàng thay đổi
🏪 Nhà hàng
📋 Quản lý thực đơn

Thêm/sửa/xóa món ăn
Upload ảnh món ăn (hỗ trợ JPG, PNG, WebP)
Ẩn/hiện món ăn tạm thời
Phân loại theo danh mục
Thống kê số lượng món đang bán/ẩn
🚁 Quản lý Drone

Xem danh sách drone và trạng thái
Thêm drone mới (mã, tên, pin, tải trọng)
Gán đơn hàng cho drone (thủ công/tự động)
Theo dõi pin, tải trọng, vị trí
Bật/tắt trạng thái bảo trì
Sạc pin drone (100% trong 1s)
Trạng thái drone: idle, delivering, returning, charging, maintenance
📊 Thống kê & Báo cáo

Tổng doanh thu theo thời gian (7 ngày, 30 ngày, 90 ngày)
Xu hướng doanh thu (biểu đồ đường)
Phân bố trạng thái đơn hàng (biểu đồ tròn)
Tỉ lệ hoàn thành đơn
Giá trị đơn hàng trung bình
🏢 Quản lý hồ sơ

Cập nhật thông tin nhà hàng
Thay đổi vị trí trên bản đồ
Upload ảnh đại diện
Cài đặt phí giao hàng, đơn tối thiểu
🛡️ Admin
👥 Quản lý người dùng

Xem danh sách người dùng (phân trang)
Tìm kiếm theo email/tên
Khoá/mở khoá tài khoản
Xem chi tiết thông tin
🏬 Quản lý nhà hàng

Duyệt/từ chối đăng ký nhà hàng mới
Xem thông tin chi tiết (địa chỉ, bản đồ, ảnh)
Khoá/mở khoá nhà hàng
Xoá nhà hàng
Trạng thái: pending, verified, suspended
🚁 Quản lý Drone toàn hệ thống

Xem tất cả drone của các nhà hàng
Thống kê theo trạng thái
Xem chi tiết drone
📊 Thống kê toàn hệ thống

Tổng doanh thu toàn bộ đơn hàng
Biểu đồ doanh thu vs chi phí
Top 5 nhà hàng có doanh thu cao nhất
Phân bố trạng thái đơn hàng
Số lượng người dùng, nhà hàng, drone
📦 Quản lý đơn hàng

Xem tất cả đơn hàng
Lọc theo trạng thái, nhà hàng
Xem chi tiết đơn (món, giá, địa chỉ, drone)

# 🏗️ Kiến trúc hệ thống

Backend - Kiến trúc 3 lớp
┌─────────────────┐
│   Controllers   │  ← Nhận request, gọi Service
├─────────────────┤
│    Services     │  ← Logic nghiệp vụ
├─────────────────┤
│  Repositories   │  ← Truy cập Database
├─────────────────┤
│     Models      │  ← Schema MongoDB
└─────────────────┘

# 🛠️ Công nghệ sử dụng
Backend
Node.js v18+ - JavaScript runtime
Express.js v4.18+ - Web framework
MongoDB v6.0+ - NoSQL database
Mongoose v7.0+ - ODM
JWT - Authentication
Multer - File upload
Bcrypt - Password hashing
Nodemailer - Email service
CORS - Cross-origin requests

Frontend
React v18.2+ - UI library
Vite v5.0+ - Build tool
React Router v6.20+ - Routing
TailwindCSS v3.4+ - Styling
Lucide React - Icons
React Toastify - Notifications
Leaflet - Maps (OpenStreetMap)
Recharts - Charts & Analytics

# 📁 Cấu trúc thư mục

Food-Fast-Delivery/
│
├── backend/
│   ├── config/
│   │   └── db.js                    # Kết nối MongoDB
│   ├── controllers/
│   │   ├── auth.controllers.js      # Đăng ký, đăng nhập
│   │   ├── cart.controllers.js      # Giỏ hàng
│   │   ├── delivery.controllers.js  # Quản lý giao hàng
│   │   ├── drone.controllers.js     # CRUD drone
│   │   ├── order.controllers.js     # Quản lý đơn hàng
│   │   ├── payment.controllers.js   # Xử lý thanh toán
│   │   ├── product.controllers.js   # CRUD sản phẩm
│   │   └── restaurant.controllers.js # CRUD nhà hàng
│   ├── middlewares/
│   │   └── auth.js                  # Xác thực JWT
│   ├── models/
│   │   ├── user.models.js
│   │   ├── restaurant.models.js
│   │   ├── product.models.js
│   │   ├── order.models.js
│   │   ├── drone.models.js
│   │   └── delivery.models.js
│   ├── repositories/
│   │   ├── user.repositories.js
│   │   ├── order.repositories.js
│   │   ├── drone.repositories.js
│   │   └── ... (tương tự cho tất cả models)
│   ├── services/
│   │   ├── drone.services.js        # Logic nghiệp vụ drone
│   │   ├── droneMovement.services.js # Di chuyển drone (realtime)
│   │   ├── order.services.js
│   │   ├── product.services.js
│   │   └── ...
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── cart.routes.js
│   │   ├── drone.routes.js
│   │   ├── order.routes.js
│   │   └── ...
│   ├── uploads/                     # Lưu ảnh upload
│   ├── .env                         # Biến môi trường
│   ├── index.js                     # Entry point
│   └── package.json
│
├── frontend/
│   ├── public/                      # Static assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Header navigation
│   │   │   ├── Footer.jsx           # Footer
│   │   │   ├── ProductCard.jsx      # Card món ăn
│   │   │   └── ProtectedRoute.jsx   # Bảo vệ route
│   │   ├── pages/
│   │   │   ├── common/              # Trang dùng chung
│   │   │   │   ├── HomePage.jsx
│   │   │   │   ├── LoginPage.jsx
│   │   │   │   ├── RegisterPage.jsx
│   │   │   │   ├── ProductsPage.jsx # Danh sách món ăn + phân trang
│   │   │   │   ├── RestaurantsPage.jsx
│   │   │   │   ├── OrdersPage.jsx
│   │   │   │   ├── OrderDetailPage.jsx
│   │   │   │   ├── PaymentPage.jsx  # Chọn địa chỉ trên bản đồ
│   │   │   │   └── ProfilePage.jsx
│   │   │   ├── restaurant/          # Trang nhà hàng
│   │   │   │   ├── RestaurantDashboard.jsx
│   │   │   │   ├── RestaurantRegisterPage.jsx
│   │   │   │   ├── MenuPage.jsx     # Quản lý thực đơn
│   │   │   │   ├── DronePage.jsx    # Quản lý drone + gán đơn
│   │   │   │   ├── OrderPage.jsx
│   │   │   │   ├── AnalyticsPage.jsx # Thống kê doanh thu
│   │   │   │   └── Profile.jsx
│   │   │   └── admin/               # Trang admin
│   │   │       ├── AdminDashboard.jsx
│   │   │       ├── ManagementOrders.jsx
│   │   │       ├── ManagementUsers.jsx
│   │   │       ├── ManagementRestaurants.jsx
│   │   │       ├── ManagementDrones.jsx
│   │   │       └── AnalyticsPageAd.jsx
│   │   ├── App.jsx                  # Main App component
│   │   ├── main.jsx                 # Entry point
│   │   └── index.css                # Global styles
│   ├── .env                         # API base URL
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── .github/
│   └── workflows/
│       ├── ci.yml                   # CI pipeline
│       └── codeql.yml               # Security scanning
│
└── README.md                        

# ⚙️ Cài đặt & Chạy

Yêu cầu hệ thống
Node.js v18+
MongoDB v6.0+
npm hoặc yarn
1. Clone repository
git clone https://github.com/yourusername/Food-Fast-Delivery.git
cd Food-Fast-Delivery

2. Cài đặt Backend
cd backend
npm install

Tạo file .env:
PORT=5000
MONGODB_URI=mongodb://localhost:27017/foodfast
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production

Chạy server:
npm run dev    # Development mode (nodemon)
# hoặc
npm start      # Production mode
Server chạy tại: http://localhost:5000

3. Cài đặt Frontend
cd ../frontend
npm install

Tạo file .env:
VITE_API_BASE=http://localhost:5000

Chạy frontend:  
npm run dev

Frontend chạy tại: http://localhost:5173

4. Truy cập ứng dụng
Trang chủ: http://localhost:5173
Đăng nhập: http://localhost:5173/login
Đăng ký khách hàng: http://localhost:5173/register
Đăng ký nhà hàng: http://localhost:5173/register-restaurant
