# Food Fast Delivery (Drone-based)

Monorepo gồm Backend (Node.js/Express/MongoDB) và Frontend (React/Vite/Tailwind) cho ứng dụng giao đồ ăn bằng drone. Hỗ trợ nhiều vai trò (khách hàng, nhà hàng, admin), quản lý menu, đơn hàng, drone, thanh toán, giỏ hàng.

## Kiến trúc & Thư mục

```
backend/
  index.js
  package.json
  .env
  api.http
  config/
    db.js
  controllers/
    auth.controllers.js
    cart.controllers.js
    delivery.controllers.js
    drone.controllers.js
    location.controllers.js
    order.controllers.js
    payment.controllers.js
    ...
  middlewares/
    auth.js
  models/
    ...
  repositories/
  routes/
  services/
  uploads/
  utils/
frontend/
  index.html
  package.json
  .env
  src/
  public/
  tailwind.config.js
  vite.config.js
```

- Điểm vào backend: [backend/index.js](backend/index.js)
- Cấu hình DB: [backend/config/db.js](backend/config/db.js)
- Controllers: ví dụ đơn hàng [backend/controllers/order.controllers.js](backend/controllers/order.controllers.js)
- Routes: [backend/routes](backend/routes)
- Services/Repositories: [backend/services](backend/services), [backend/repositories](backend/repositories)
- Upload ảnh: [backend/uploads](backend/uploads)
- Trang quản lý thực đơn: [frontend/src/pages/restaurant/MenuPage.jsx](frontend/src/pages/restaurant/MenuPage.jsx)
- Trang drone nhà hàng: [frontend/src/pages/restaurant/DronePage.jsx](frontend/src/pages/restaurant/DronePage.jsx)
- Dashboard nhà hàng: [frontend/src/pages/restaurant/RestaurantDashboard.jsx](frontend/src/pages/restaurant/RestaurantDashboard.jsx)

## Tính năng chính

- Xác thực người dùng, phân quyền.
- Quản lý thực đơn nhà hàng: tạo/sửa/xóa món, danh mục, trạng thái hiển thị (tạm ẩn/đang bán), upload ảnh.
- Quản lý đơn hàng: đặt hàng, theo dõi trạng thái, xác nhận hoàn thành.
- Quản lý drone: tạo/cập nhật, phân bổ giao hàng.
- Giỏ hàng và thanh toán (endpoint sẵn trong backend).
- File [backend/api.http](backend/api.http) để thử nhanh API trong VS Code.

## Yêu cầu

- Node.js 18+ và npm
- MongoDB đang chạy (local hoặc connection string từ cloud)

## Cấu hình môi trường

Backend (.env) – cập nhật [backend/.env](backend/.env):
````bash
# Backend
PORT=5000
MONGODB_URI=mongodb://localhost:27017/foodfast
JWT_SECRET=your_jwt_secret
