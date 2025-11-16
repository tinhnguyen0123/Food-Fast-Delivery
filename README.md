# Food Fast Delivery

Ứng dụng giao đồ ăn hiện đại sử dụng công nghệ drone, hỗ trợ đầy đủ tính năng quản lý đơn hàng, thực đơn, drone và thống kê doanh thu cho ba vai trò: **Khách hàng**, **Nhà hàng**, và **Admin**.

---

## 📋 Mục lục

* ✨ [Tính năng chính](#-tính-năng-chính)
* 🏗️ [Kiến trúc hệ thống](#️-kiến-trúc-hệ-thống)
* 🛠️ [Công nghệ sử dụng](#️-công-nghệ-sử-dụng)
* 📁 [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
* ⚙️ [Cài đặt và chạy](#️-cài-đặt--chạy)
* 🔐 [Cấu hình môi trường](#-cấu-hình-môi-trường)
* 📡 [API Endpoints](#-api-endpoints)
* 🤝 [Đóng góp](#-đóng-góp)
* 📄 [License](#-license)

---

## ✨ Tính năng chính

### 👤 Khách hàng

#### ✅ Duyệt & Tìm kiếm sản phẩm

* Xem danh sách món ăn theo danh mục hoặc nhà hàng.
* Tìm kiếm theo tên món.
* Phân trang client-side (10/20/50/100 món/trang).
* Lọc theo: giá, đánh giá, khoảng cách.

#### 🛒 Giỏ hàng thông minh

* Thêm/xóa/cập nhật số lượng món.
* Tự động gộp món theo nhà hàng.
* Tính phí giao hàng tự động.
* Lưu giỏ hàng qua nhiều phiên.

#### 📦 Quản lý đơn hàng

* Xem lịch sử.
* Theo dõi trạng thái realtime.
* Nhận thông báo khi drone đến.
* Xác nhận hoàn tất.
* Đánh giá đơn hàng.

#### 💳 Thanh toán linh hoạt

* COD.
* MoMo Wallet.
* Chọn địa chỉ trên bản đồ.
* Tìm kiếm địa chỉ tự động (Nominatim API).

#### 🔔 Thông báo realtime

* Drone nhận đơn và đang bay.
* Đơn đến nơi (tự động nhắc sau 10s).
* Trạng thái đơn thay đổi.

---

### 🏪 Nhà hàng

#### 📋 Quản lý thực đơn

* CRUD sản phẩm.
* Upload ảnh (JPG, PNG, WebP).
* Ẩn/hiện sản phẩm.
* Thống kê số lượng món.

#### 🚁 Quản lý Drone

* Xem danh sách drone.
* Thêm drone mới (mã, tên, pin, tải trọng).
* Gán đơn thủ công/tự động.
* Theo dõi pin, tải trọng, vị trí.
* Trạng thái drone: idle, delivering, returning, charging, maintenance.
* Sạc pin (100% trong 1 giây).

#### 📊 Thống kê & Báo cáo

* Doanh thu theo thời gian (7/30/90 ngày).
* Biểu đồ đường / tròn.
* Giá trị đơn trung bình.
* Tỉ lệ hoàn thành.

#### 🏢 Quản lý hồ sơ nhà hàng

* Cập nhật thông tin.
* Thay đổi vị trí bản đồ.
* Ảnh đại diện.
* Cài đặt phí giao hàng.

---

### 🛡️ Admin

#### 👥 Quản lý người dùng

* Danh sách + phân trang.
* Tìm kiếm.
* Khoá/Mở khoá.
* Xem chi tiết.

#### 🏬 Quản lý nhà hàng

* Duyệt đăng ký.
* Khoá/Mở.
* Xem chi tiết.
* Xóa nhà hàng.
* Trạng thái: pending — verified — suspended.

#### 🚁 Quản lý Drone toàn hệ thống

* Xem tất cả drone.
* Thống kê theo trạng thái.
* Xem chi tiết.

#### 📊 Thống kê toàn hệ thống

* Tổng doanh thu.
* Chi phí vs doanh thu.
* Top 5 nhà hàng.
* Phân bố trạng thái đơn.
* Số lượng user, restaurant, drone.

#### 📦 Quản lý đơn hàng

* Xem tất cả đơn.
* Lọc theo trạng thái.
* Xem chi tiết.

---

## 🏗️ Kiến trúc hệ thống

### Backend — Kiến trúc 3 lớp

```
┌─────────────────┐
│   Controllers   │  ← Nhận request
├─────────────────┤
│    Services     │  ← Logic nghiệp vụ
├─────────────────┤
│  Repositories   │  ← Truy cập dữ liệu
├─────────────────┤
│     Models      │  ← Mongoose Schema
└─────────────────┘
```

---

## 🛠️ Công nghệ sử dụng

### Backend

* Node.js v18+
* Express.js
* MongoDB / Mongoose
* JWT Auth
* Multer (Upload ảnh)
* Bcrypt
* Nodemailer
* CORS

### Frontend

* React 18
* Vite
* TailwindCSS
* React Router
* Lucide React
* React Toastify
* Leaflet (Maps)
* Recharts

---

## 📁 Cấu trúc thư mục

```
Food-Fast-Delivery/
│
├── backend/
│   ├── config/
│   │   └── db.js                           # Kết nối MongoDB
│   │
│   ├── controllers/                        # Nhận request, gọi Service
│   │   ├── auth.controllers.js             # Đăng ký, đăng nhập, đăng xuất
│   │   ├── user.controllers.js             # CRUD user
│   │   ├── restaurant.controllers.js       # CRUD nhà hàng
│   │   ├── product.controllers.js          # CRUD sản phẩm
│   │   ├── cart.controllers.js             # Giỏ hàng
│   │   ├── order.controllers.js            # Quản lý đơn hàng
│   │   ├── payment.controllers.js          # Xử lý thanh toán (MoMo)
│   │   ├── drone.controllers.js            # CRUD drone + gán đơn
│   │   ├── delivery.controllers.js         # Quản lý giao hàng
│   │   └── location.controllers.js         # CRUD vị trí
│   │
│   ├── middlewares/
│   │   └── auth.js                         # Xác thực JWT, phân quyền
│   │
│   ├── models/                             # Schema MongoDB
│   │   ├── user.models.js
│   │   ├── restaurant.models.js
│   │   ├── product.models.js
│   │   ├── order.models.js
│   │   ├── drone.models.js
│   │   ├── delivery.models.js
│   │   └── location.models.js
│   │
│   ├── repositories/                       # Truy cập Database
│   │   ├── user.repositories.js
│   │   ├── restaurant.repositories.js
│   │   ├── product.repositories.js
│   │   ├── order.repositories.js
│   │   ├── drone.repositories.js
│   │   ├── delivery.repositories.js
│   │   └── location.repositories.js
│   │
│   ├── services/                           # Logic nghiệp vụ
│   │   ├── auth.services.js
│   │   ├── user.services.js
│   │   ├── restaurant.services.js
│   │   ├── product.services.js
│   │   ├── order.services.js
│   │   ├── payment.services.js
│   │   ├── drone.services.js               # Gán drone, cập nhật trạng thái
│   │   ├── droneMovement.services.js       # Di chuyển drone realtime
│   │   ├── delivery.services.js
│   │   └── location.services.js
│   │
│   ├── routes/                             # Định nghĩa API routes
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── restaurant.routes.js
│   │   ├── product.routes.js
│   │   ├── cart.routes.js
│   │   ├── order.routes.js
│   │   ├── payment.routes.js
│   │   ├── drone.routes.js
│   │   ├── delivery.routes.js
│   │   └── location.routes.js
│   │
│   ├── uploads/                            # Lưu ảnh upload tạm (trước khi lên Cloudinary)
│   │
│   ├── utils/
│   │   ├── cloudinary.js                   # Upload/delete ảnh Cloudinary
│   │   └── generateToken.js                # Tạo JWT token
│   │
│   ├── .env                                # Biến môi trường (không commit)
│   ├── .gitignore
│   ├── index.js                            # Entry point server
│   ├── package.json
│   └── api.http                            # Test API với REST Client (VSCode)
│
├── frontend/
│   ├── public/                             # Static assets
│   │   └── vite.svg
│   │
│   ├── src/
│   │   ├── assets/                         # Ảnh, logo
│   │   │
│   │   ├── components/                     # Reusable components
│   │   │   ├── Navbar.jsx                  # Header navigation + notifications
│   │   │   ├── Footer.jsx                  # Footer
│   │   │   ├── ProductCard.jsx             # Card hiển thị món ăn
│   │   │   └── ProtectedRoute.jsx          # Bảo vệ route theo role
│   │   │
│   │   ├── pages/
│   │   │   ├── common/                     # Trang dùng chung
│   │   │   │   ├── HomePage.jsx            # Trang chủ
│   │   │   │   ├── LoginPage.jsx           # Đăng nhập
│   │   │   │   ├── RegisterPage.jsx        # Đăng ký khách hàng
│   │   │   │   ├── ProductsPage.jsx        # Danh sách món ăn + phân trang
│   │   │   │   ├── RestaurantsPage.jsx     # Danh sách nhà hàng
│   │   │   │   ├── OrdersPage.jsx          # Lịch sử đơn hàng (tabs lọc)
│   │   │   │   ├── OrderDetailPage.jsx     # Chi tiết đơn + bản đồ tracking
│   │   │   │   ├── PaymentPage.jsx         # Chọn địa chỉ trên map + thanh toán
│   │   │   │   └── ProfilePage.jsx         # Hồ sơ cá nhân
│   │   │   │
│   │   │   ├── restaurant/                 # Trang nhà hàng
│   │   │   │   ├── RestaurantDashboard.jsx # Dashboard nhà hàng (tab navigation)
│   │   │   │   ├── RestaurantRegisterPage.jsx # Đăng ký nhà hàng (3 bước)
│   │   │   │   ├── MenuPage.jsx            # Quản lý thực đơn (CRUD + ẩn/hiện)
│   │   │   │   ├── DronePage.jsx           # Quản lý drone + gán đơn
│   │   │   │   ├── OrderPage.jsx           # Đơn hàng của nhà hàng
│   │   │   │   ├── AnalyticsPage.jsx       # Thống kê doanh thu (biểu đồ)
│   │   │   │   └── Profile.jsx             # Hồ sơ nhà hàng
│   │   │   │
│   │   │   └── admin/                      # Trang admin
│   │   │       ├── AdminDashboard.jsx      # Dashboard admin (card navigation)
│   │   │       ├── ManagementOrders.jsx    # Quản lý tất cả đơn hàng
│   │   │       ├── ManagementUsers.jsx     # Quản lý users (khoá/mở)
│   │   │       ├── ManagementRestaurants.jsx # Duyệt/khoá nhà hàng
│   │   │       ├── ManagementDrones.jsx    # Xem tất cả drone
│   │   │       └── AnalyticsPageAd.jsx     # Thống kê toàn hệ thống
│   │   │
│   │   ├── App.jsx                         # Main App component (routing)
│   │   ├── main.jsx                        # Entry point React
│   │   ├── index.css                       # Global CSS + Tailwind imports
│   │   └── App.css                         # Component styles
│   │
│   ├── .env                                # API base URL (VITE_API_BASE)
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── index.html                          # HTML template
│   ├── package.json
│   ├── postcss.config.js                   # PostCSS config (Tailwind)
│   ├── tailwind.config.js                  # Tailwind config
│   ├── vite.config.js                      # Vite config
│   └── README.md
│
├── .github/
│   └── workflows/
│       ├── ci.yml                          # CI pipeline (build + test)
│                          
│
├── .gitignore
├── LICENSE
└── README.md                               
```

## ⚙️ Cài đặt & Chạy

### 1. Clone project

```bash
git clone https://github.com/yourusername/Food-Fast-Delivery.git
cd Food-Fast-Delivery
```

### 2. Backend

```bash
cd backend
npm install
```

Tạo file `.env`:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/foodfast
JWT_SECRET=your_secret_key
```

Chạy server:

```bash
npm run dev
```

Backend chạy tại: [http://localhost:5000](http://localhost:5000)

### 3. Frontend

```bash
cd ../frontend
npm install
```

Tạo file `.env`:

```
VITE_API_BASE=http://localhost:5000
```

Chạy app:

```bash
npm run dev
```

Frontend chạy tại: [http://localhost:5173](http://localhost:5173)

---

## 🔐 Cấu hình môi trường

### Backend `.env`

```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/foodfast
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
MAX_FILE_SIZE=5242880
```

### Frontend `.env`

```
VITE_API_BASE=http://localhost:5000
VITE_APP_NAME=Food Fast Delivery
VITE_APP_VERSION=1.0.0
```

---

## 📡 API Endpoints

### 🔐 Authentication

```
POST   /api/auth/register       # Đăng ký tài khoản
POST   /api/auth/login          # Đăng nhập
POST   /api/auth/logout         # Đăng xuất
GET    /api/auth/me             # Lấy thông tin user hiện tại
```

### 👤 Users

```
GET    /api/user                # Lấy danh sách users (admin)
GET    /api/user/:id            # Lấy thông tin user
PUT    /api/user/:id            # Cập nhật thông tin
DELETE /api/user/:id            # Xoá user (admin)
PUT    /api/user/:id/toggle     # Khoá/mở khoá user (admin)
```

### 🏬 Restaurants

```
GET    /api/restaurant                  # Lấy tất cả nhà hàng
GET    /api/restaurant/:id              # Chi tiết nhà hàng
POST   /api/restaurant                  # Đăng ký nhà hàng mới
PUT    /api/restaurant/:id              # Cập nhật thông tin
DELETE /api/restaurant/:id              # Xoá nhà hàng (admin)
GET    /api/restaurant/owner/:ownerId   # Nhà hàng của chủ
PUT    /api/restaurant/:id/status       # Duyệt/khoá (admin)
```

### 🍔 Products

```
GET    /api/product                     # Tất cả sản phẩm
GET    /api/product/:id                 # Chi tiết sản phẩm
GET    /api/product/restaurant/:id      # Sản phẩm theo nhà hàng
GET    /api/product/category/:category  # Sản phẩm theo danh mục
GET    /api/product/categories          # Danh sách danh mục
POST   /api/product                     # Tạo sản phẩm mới
PUT    /api/product/:id                 # Cập nhật sản phẩm
DELETE /api/product/:id                 # Xoá sản phẩm
```

### 🛒 Cart

```
GET    /api/cart/latest             # Giỏ hàng mới nhất
POST   /api/cart                    # Tạo giỏ hàng mới
POST   /api/cart/add                # Thêm món vào giỏ
PUT    /api/cart/:id/item           # Cập nhật số lượng món
DELETE /api/cart/:id/item           # Xoá món khỏi giỏ
DELETE /api/cart/:id                # Xoá giỏ hàng
```

### 📦 Orders

```
GET    /api/order                       # Tất cả đơn hàng (admin)
GET    /api/order/:id                   # Chi tiết đơn hàng
GET    /api/order/user/:userId          # Đơn hàng của user
GET    /api/order/restaurant/:restId    # Đơn hàng của nhà hàng
POST   /api/order                       # Tạo đơn hàng mới
PUT    /api/order/:id                   # Cập nhật trạng thái
PUT    /api/order/:id/confirm-completed # Khách xác nhận đã nhận
DELETE /api/order/:id                   # Huỷ đơn
```

### 🚁 Drones

```
GET    /api/drone                   # Tất cả drone
GET    /api/drone/:id               # Chi tiết drone
GET    /api/drone/restaurant/:id    # Drone của nhà hàng
POST   /api/drone                   # Tạo drone mới
PUT    /api/drone/:id               # Cập nhật drone
DELETE /api/drone/:id               # Xoá drone
POST   /api/drone/auto-assign       # Gán đơn tự động
POST   /api/drone/:id/charge        # Sạc pin drone
```

### 🚚 Delivery

```
GET    /api/delivery/order/:orderId     # Thông tin giao hàng
POST   /api/delivery                    # Tạo delivery mới
PUT    /api/delivery/:id                # Cập nhật trạng thái
```

### 💳 Payment

```
POST   /api/payment                 # Tạo giao dịch thanh toán
GET    /api/payment/callback        # Callback từ MoMo
```

---

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón!

1. Fork dự án
2. Tạo branch mới: `feature/your-feature`
3. Commit và tạo Pull Request

---

## 📄 License

MIT License — sử dụng miễn phí cho mục đích học tập và phát triển.

---
