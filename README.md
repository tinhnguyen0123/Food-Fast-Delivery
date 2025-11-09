# Food Fast Delivery (Drone Based)

Ứng dụng giao đồ ăn sử dụng drone. Hệ thống hỗ trợ 3 vai trò: Khách hàng, Nhà hàng và Admin; gồm quản lý thực đơn, giỏ hàng, đơn hàng, giao hàng bằng drone, theo dõi trạng thái và phân trang sản phẩm.

## 1) Mục tiêu dự án

- Cho phép khách hàng duyệt món, tìm kiếm, lọc theo danh mục, thêm vào giỏ và đặt hàng.
- Nhà hàng quản lý thực đơn (thêm/sửa/xóa/ẩn hiện), theo dõi đơn và điều phối drone.
- Drone nhận đơn, chuyển trạng thái giao hàng; khách xác nhận hoàn thành.
- Hệ thống thông báo cho khách khi đơn bắt đầu giao và nhắc xác nhận.
- Kiến trúc backend 3 lớp rõ ràng: Controller → Service → Repository → Model.

## 2) Kiến trúc

Backend theo mô hình 3 lớp:
- Controllers: nhận request/response (ví dụ: [backend/controllers/order.controllers.js](backend/controllers/order.controllers.js))
- Services: xử lý nghiệp vụ (ví dụ: [backend/services/product.services.js](backend/services/product.services.js))
- Repositories: truy cập database (MongoDB)
- Models: định nghĩa schema
- Kết nối DB: [backend/config/db.js](backend/config/db.js)
- Điểm vào server: [backend/index.js](backend/index.js)

Frontend (React + Vite + Tailwind):
- Trang khách: sản phẩm, tìm kiếm, phân trang, giỏ hàng, đặt hàng
- Trang nhà hàng: quản lý menu, drone, đơn hàng
- Trang chủ/giới thiệu: [frontend/src/pages/common/HomePage.jsx](frontend/src/pages/common/HomePage.jsx)
- Trang sản phẩm (khách): [frontend/src/pages/common/ProductsPage.jsx](frontend/src/pages/common/ProductsPage.jsx)
- Quản lý thực đơn (nhà hàng): [frontend/src/pages/restaurant/MenuPage.jsx](frontend/src/pages/restaurant/MenuPage.jsx)
- Quản lý drone (nhà hàng): [frontend/src/pages/restaurant/DronePage.jsx](frontend/src/pages/restaurant/DronePage.jsx)

## 3) Chức năng chính đã hoàn thành

Khách hàng
- Duyệt sản phẩm theo danh mục/nhà hàng, tìm kiếm theo tên.
- Phân trang phía client trong trang sản phẩm: [frontend/src/pages/common/ProductsPage.jsx](frontend/src/pages/common/ProductsPage.jsx).
- Giỏ hàng: tạo giỏ, thêm sản phẩm, tạo đơn (API dùng trong code).
- Nhận thông báo khi đơn chuyển sang “đang giao” và nhắc xác nhận sau 10 giây.
- Xác nhận hoàn thành đơn tại trang chi tiết (endpoint riêng PUT `/api/order/:id/confirm-completed`).

Nhà hàng
- Quản lý thực đơn: tạo/sửa/xóa món; tải ảnh; ẩn/hiện món.
- Khi “Tạm ẩn”, món không hiển thị cho khách; món đã có trong giỏ có thể bị loại khi tạo đơn (được thông báo).
- Quản lý/quan sát drone và đơn hàng (giao diện tại [frontend/src/pages/restaurant/DronePage.jsx](frontend/src/pages/restaurant/DronePage.jsx)).

Drone & giao hàng
- Drone nhận đơn, chuyển trạng thái đơn sang “delivering”.
- Sau khi khách xác nhận hoàn thành, đơn “completed”, drone về trạng thái “sẵn sàng” (idle).
- Giảm pin drone 15% cho mỗi đơn hoàn thành (nghiệp vụ xử lý trong Order/Delivery/Drone service).

Admin
- (Tuỳ cấu hình) Xem danh sách đơn toàn hệ thống qua endpoint tổng.

## 4) Thư mục dự án

```
README.md
backend/
  .env
  api.http
  index.js
  package.json
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
    ...
  models/
  repositories/
  routes/
  services/
  uploads/
  utils/
frontend/
  .env
  .gitignore
  eslint.config.js
  index.html
  package.json
  postcss.config.js
  README.md
  tailwind.config.js
  vite.config.js
  public/
  src/
```

Một số file tiêu biểu:
- Server: [backend/index.js](backend/index.js)
- Kết nối DB: [backend/config/db.js](backend/config/db.js)
- Controller đơn hàng: [backend/controllers/order.controllers.js](backend/controllers/order.controllers.js)
- Service sản phẩm: [backend/services/product.services.js](backend/services/product.services.js)
- Trang sản phẩm (khách): [frontend/src/pages/common/ProductsPage.jsx](frontend/src/pages/common/ProductsPage.jsx)
- Trang menu (nhà hàng): [frontend/src/pages/restaurant/MenuPage.jsx](frontend/src/pages/restaurant/MenuPage.jsx)
- Trang drone (nhà hàng): [frontend/src/pages/restaurant/DronePage.jsx](frontend/src/pages/restaurant/DronePage.jsx)
- Trang chủ: [frontend/src/pages/common/HomePage.jsx](frontend/src/pages/common/HomePage.jsx)

## 5) Công nghệ sử dụng

Backend
- Node.js, Express, MongoDB (Mongoose)
- Xác thực JWT, Multer (upload), CORS, Dotenv, Nodemailer
- NPM scripts: start/dev (xem [backend/package.json](backend/package.json))

Frontend
- React + Vite
- TailwindCSS
- Lucide Icons
- React Toastify

## 6) Thiết lập môi trường

Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/foodfast
JWT_SECRET=your_jwt_secret
```

Frontend (.env)
```
VITE_API_BASE=http://localhost:5000
```

## 7) Cài đặt & chạy

Backend
```
cd backend
npm install
npm run dev
# hoặc: npm start
```

Frontend
```
cd frontend
npm install
npm run dev
# Mặc định Vite: http://localhost:5173
```

## 8) Luồng nghiệp vụ chính

Đặt món & giao hàng
1. Khách duyệt sản phẩm theo danh mục/nhà hàng tại [frontend/src/pages/common/ProductsPage.jsx](frontend/src/pages/common/ProductsPage.jsx), tìm kiếm, phân trang.
2. Thêm vào giỏ thông qua API:
   - GET `/api/cart/latest`
   - POST `/api/cart`
   - POST `/api/cart/add`
3. Tạo đơn hàng (endpoint trong Order Controller).
4. Nhà hàng chuẩn bị → giao hàng bằng drone.
5. Khi drone bắt đầu giao:
   - Hệ thống tạo thông báo “Drone đã nhận đơn” cho khách.
   - Sau 10s, nhắc “Đơn đã đến nơi, vui lòng xác nhận”.
6. Khách mở chi tiết đơn hàng và bấm “Xác nhận hoàn thành” (PUT `/api/order/:id/confirm-completed`).
7. Hệ thống chuyển đơn `completed`, drone về `idle`, và trừ 15% pin cho mỗi đơn hoàn thành.

Ẩn/hiện món ăn
- Nhà hàng có thể bật “Tạm ẩn” món trong [frontend/src/pages/restaurant/MenuPage.jsx](frontend/src/pages/restaurant/MenuPage.jsx).
- Khi ẩn: món biến mất khỏi danh sách khách, không thể thêm mới vào giỏ.
- Nếu món đang có trong giỏ trước đó, hệ thống có thể loại bỏ khi tạo đơn và thông báo cho khách.

Phân trang sản phẩm (khách)
- Đang áp dụng phân trang phía client tại [frontend/src/pages/common/ProductsPage.jsx](frontend/src/pages/common/ProductsPage.jsx).
- Người dùng có thể chọn số món mỗi trang, chuyển trang đầu/trước/sau/cuối, hiển thị tổng số món.

## 9) API tổng quan (rút gọn)

Auth
- POST `/api/auth/register`, POST `/api/auth/login`

Sản phẩm
- GET `/api/product/categories` — danh sách danh mục
- GET `/api/product/category/:category` — theo danh mục
- GET `/api/product/restaurant/:restaurantId` — theo nhà hàng
- PUT `/api/product/:id` — cập nhật/thay đổi trạng thái (ví dụ tạm ẩn/hiện) trong controller tương ứng

Giỏ hàng
- GET `/api/cart/latest`
- POST `/api/cart`
- POST `/api/cart/add`

Đơn hàng
- GET `/api/order/user/:userId` — đơn của người dùng
- PUT `/api/order/:id/confirm-completed` — khách xác nhận hoàn thành (đưa drone về idle, trừ pin)

Nhà hàng/Drone
- GET `/api/restaurant/:id` — thông tin nhà hàng
- Các API drone/điều phối trong controllers và routes tương ứng (xem thư mục [backend/routes](backend/routes))

Chi tiết triển khai xem:
- Controller đơn hàng: [backend/controllers/order.controllers.js](backend/controllers/order.controllers.js)
- Service sản phẩm: [backend/services/product.services.js](backend/services/product.services.js)

## 10) Gợi ý phát triển tiếp

- Realtime bằng WebSocket/SSE thay cho polling.
- Phân trang server-side cho sản phẩm/đơn hàng khi dữ liệu lớn.
- Ràng buộc năng lượng/pin drone trước khi nhận đơn.
- Thêm unit/integration test, CI/CD.
- RBAC chi tiết hơn cho Admin/Nhà hàng/Khách.

## 11) Lưu ý

- Thư mục upload chứa file nhị phân tạm: [backend/uploads](backend/uploads).
- Đảm bảo JWT_SECRET bảo mật khi deploy.
- Sử dụng HTTPS và reverse proxy cho môi trường production.

---
Liên kết nhanh:
- Server: [backend/index.js](backend/index.js)
- Kết nối DB: [backend/config/db.js](backend/config/db.js)
- Sản phẩm (khách): [frontend/src/pages/common/ProductsPage.jsx](frontend/src/pages/common/ProductsPage.jsx)
- Menu (nhà hàng): [frontend/src/pages/restaurant/MenuPage.jsx](frontend/src/pages/restaurant/MenuPage.jsx)
- Drone (nhà hàng): [frontend/src/pages/restaurant/DronePage.jsx](frontend/src/pages/restaurant/DronePage.jsx)
- Trang chủ: [frontend/src/pages/common/HomePage.jsx](frontend/src/pages/common/HomePage.jsx)
