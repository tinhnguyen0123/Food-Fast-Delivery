# Food Fast Delivery (Drone Based)

Ứng dụng giao đồ ăn sử dụng drone với đa vai trò (Khách hàng, Nhà hàng, Admin). Hỗ trợ quản lý thực đơn, đơn hàng, drone, giỏ hàng, thanh toán và hệ thống thông báo theo trạng thái giao hàng.

## 1. Kiến trúc

Backend theo mô hình 3 lớp (Controller → Service → Repository → Model):
- Controllers: xử lý request HTTP (ví dụ: [backend/controllers/order.controllers.js](backend/controllers/order.controllers.js))
- Services: nghiệp vụ (ví dụ: [backend/services/product.services.js](backend/services/product.services.js), [backend/services/restaurant.services.js](backend/services/restaurant.services.js))
- Repositories: truy cập dữ liệu (MongoDB)
- Models: định nghĩa schema
- Upload / media: lưu tệp tạm trong [backend/uploads](backend/uploads)

Frontend: React + Vite + Tailwind, phân tách theo vai trò qua biến môi trường (script chạy 3 cổng khác nhau).

## 2. Vai trò & luồng chính

Khách hàng:
- Đăng ký / đăng nhập
- Duyệt món, tìm kiếm, lọc theo danh mục
- Thêm giỏ hàng, tạo đơn, nhận thông báo giao hàng
- Xác nhận đơn khi drone giao tới (cập nhật trạng thái + giảm pin drone)

Nhà hàng:
- Quản lý thực đơn: thêm / sửa / xóa / tạm ẩn / hiện món ([frontend/src/pages/restaurant/MenuPage.jsx](frontend/src/pages/restaurant/MenuPage.jsx))
- Quản lý drone: tạo, phân bổ đơn tự động, theo dõi pin ([frontend/src/pages/restaurant/DronePage.jsx](frontend/src/pages/restaurant/DronePage.jsx))
- Xem đơn theo trạng thái 

Admin:
- Quản lý tổng thể / phân tích (ví dụ biểu đồ: [frontend/src/pages/admin/AnalyticsPageAd.jsx](frontend/src/pages/admin/AnalyticsPageAd.jsx))
- Quản lý danh sách đơn nếu đã bật endpoint lấy tất cả

## 3. Tính năng đã hoàn thành

- Đăng nhập / JWT / phân quyền
- Quản lý món ăn + upload ảnh (Cloudinary hỗ trợ trong services)
- Phân trang sản phẩm (backend + frontend)
- Drone nhận đơn, giao hàng, hoàn thành tự động khi khách xác nhận
- Thông báo realtime dạng polling ở Navbar khách hàng (khi drone bắt đầu giao + sau 10s nhắc xác nhận)
- Khách xác nhận hoàn thành qua endpoint riêng PUT /api/order/:id/confirm-completed
- Sửa lỗi trang admin chưa tải danh sách đơn (thêm getAllOrders)
- Layout MenuPage được thiết kế lại đồng bộ giao diện
- Kiến trúc tách lớp rõ ràng

## 4. Công nghệ

Backend:
- Node.js, Express ([backend/index.js](backend/index.js))
- MongoDB + Mongoose
- Multer (upload), Cloudinary (tùy chọn), JWT, Nodemailer
Frontend:
- React + Vite ([frontend/index.html](frontend/index.html))
- TailwindCSS ([frontend/tailwind.config.js](frontend/tailwind.config.js))
- Lucide Icons
- Toast thông báo
- Recharts (phân tích)

## 5. Cấu trúc thư mục

```
backend/
  index.js
  controllers/
  services/
  repositories/
  models/
  routes/
  middlewares/
  uploads/
frontend/
  src/
    pages/
    components/
    hooks/
    store/
```

## 6. Thiết lập môi trường

Backend (.env):
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/foodfast
JWT_SECRET=your_jwt_secret
```

Frontend (.env):
```
VITE_API_BASE=http://localhost:5000
```

## 7. Cài đặt & chạy

Backend:
```
cd backend
npm install
npm run dev
```

Frontend (chạy cả 3 vai trò):
```
cd frontend
npm install
npm run dev
```
Hoặc chạy riêng:
```
npm run dev:customer
npm run dev:admin
npm run dev:restaurant
```

Mặc định:
- Customer: http://localhost:5173
- Admin: http://localhost:5174
- Restaurant: http://localhost:5175

## 8. Endpoint chính (rút gọn)

- Auth: POST /api/auth/login / register
- Product:
  - GET /api/product/restaurant/:restaurantId?page=&limit=
  - PUT /api/product/:id (toggle available)
- Order:
  - GET /api/order/user/:userId
  - PUT /api/order/:id/confirm-completed (khách xác nhận)
  - (Admin) GET /api/order/
- Drone:
  - GET /api/drone/restaurant/:id
  - POST /api/drone/
  - PATCH /api/drone/:id

Xem đầy đủ trong [backend/routes](backend/routes).

## 9. Thông báo đơn hàng

Logic polling & thông báo ở Navbar (customer):
- Khi trạng thái đơn chuyển sang delivering → tạo thông báo “Drone đã nhận đơn”
- Sau 10 giây → thông báo “Đơn hàng đã đến nơi, vui lòng xác nhận”
- Khi khách xác nhận → đơn completed → drone idle + giảm pin 15%

## 10. Phân trang

Áp dụng cho:
- Menu nhà hàng ([frontend/src/pages/restaurant/MenuPage.jsx](frontend/src/pages/restaurant/MenuPage.jsx))
- Trang khách hàng (Products / Orders nếu mở rộng)
Backend trả:
```
{
  items: [...],
  page: 1,
  limit: 12,
  total: 120,
  totalPages: 10
}
```
Dạng mảng cũ vẫn tương thích nếu không truyền query.

## 11. Các cải tiến có thể thêm

- WebSocket thay polling
- Kiểm tra pin drone trước khi nhận đơn
- Lịch sử giảm pin / bảo trì drone
- Thêm unit test / integration test
- Role & policy mạnh hơn (RBAC)

## 12. Ghi chú

- Thư mục [backend/uploads](backend/uploads) chứa file nhị phân tạm (không cần commit đầy đủ)
- Kiểm tra JWT_SECRET bảo mật trước khi deploy
- Sử dụng reverse proxy / HTTPS cho production

## 13. Giấy phép

Tùy chỉnh (MIT hoặc riêng). Chưa khai báo trong README trước.

---
Liên kết nhanh:
- Server: [backend/index.js](backend/index.js)
- Menu: [frontend/src/pages/restaurant/MenuPage.jsx](frontend/src/pages/restaurant/MenuPage.jsx)
- Drone: [frontend/src/pages/restaurant/DronePage.jsx](frontend/src/pages/restaurant/DronePage.jsx)
- Order Controller: [backend/controllers/order.controllers.js](backend/controllers/order.controllers.js)
- Product Service: [backend/services/product.services.js](backend/services/product.services.js)
- Restaurant Service: [backend/services/restaurant.services.js](backend/services/restaurant.services.js)
