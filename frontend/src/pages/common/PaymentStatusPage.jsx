// src/pages/PaymentStatusPage.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { CheckCircle, XCircle, Clock } from "lucide-react";

// Hàm xóa giỏ hàng (sao chép từ PaymentPage hoặc import từ context/hook)
// Tạm thời để ở đây cho đơn giản
const clearCartOnServer = async (cartId) => {
  try {
    const token = localStorage.getItem("token");
    // Lấy cartId từ localStorage nếu cần, hoặc bạn có thể lưu cartId
    // vào localStorage trước khi chuyển hướng
    // Giả sử cartId được lưu:
    const storedCartId = localStorage.getItem("currentCartId"); // Bạn phải tự lưu cái này
    if (!token || !storedCartId) return;

    await fetch(`http://localhost:5000/api/cart/${storedCartId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    localStorage.removeItem("currentCartId"); // Xóa đi sau khi dùng
  } catch (e) {
    console.warn("Cannot clear cart:", e);
  }
};

export default function PaymentStatusPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const paymentId = searchParams.get("paymentId");
  const resultCode = searchParams.get("resultCode"); // MoMo cũng trả về cái này

  const [status, setStatus] = useState("pending"); // 'pending', 'paid', 'failed'
  const [message, setMessage] = useState("Đang xử lý thanh toán...");

  // Hàm gọi API để kiểm tra trạng thái payment
  const checkPaymentStatus = useCallback(async () => {
    if (!paymentId) {
      setStatus("failed");
      setMessage("Không tìm thấy mã thanh toán.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/payment/${paymentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Không thể lấy trạng thái thanh toán");

      const payment = await res.json();

      if (payment.status === "paid") {
        setStatus("paid");
        setMessage("Thanh toán thành công! Đơn hàng đang được chuẩn bị.");
        toast.success("Thanh toán thành công!");

        // 🔹 QUAN TRỌNG: Xóa giỏ hàng CHỈ KHI thành công
        // Bạn cần một cách để lấy cartId, ví dụ lưu vào localStorage
        // TRƯỚC KHI chuyển sang MoMo
        // (Trong PaymentPage.jsx, trước "window.location.href = ...")
        // localStorage.setItem("currentCartId", cart._id);
        const storedCartId = localStorage.getItem("currentCartId");
        if (storedCartId) {
          await clearCartOnServer(storedCartId);
        }

        // Tự động chuyển về trang đơn hàng
        setTimeout(() => navigate("/orders"), 3000);
      } else if (payment.status === "failed") {
        setStatus("failed");
        setMessage(
          "Thanh toán thất bại hoặc đã bị hủy. Giỏ hàng của bạn vẫn được giữ nguyên."
        );
        toast.error("Thanh toán thất bại!");
        setTimeout(() => navigate("/cart"), 3000); // Quay về giỏ hàng
      } else {
        // Vẫn đang "pending", có thể IPN chưa về kịp
        // resultCode từ MoMo (nếu != 0) có thể cho biết lỗi ngay
        if (resultCode && resultCode !== "0") {
          setStatus("failed");
          setMessage("Giao dịch bị hủy hoặc thất bại.");
          toast.error("Giao dịch không thành công.");
          setTimeout(() => navigate("/cart"), 3000);
        } else {
          // Vẫn pending, tiếp tục chờ
          setMessage("Đang chờ xác nhận từ MoMo...");
        }
      }
    } catch (err) {
      console.error(err);
      setStatus("failed");
      setMessage("Lỗi khi kiểm tra thanh toán.");
    }
  }, [paymentId, navigate, resultCode]);

  // Sử dụng polling để kiểm tra trạng thái, phòng trường hợp IPN chậm
  useEffect(() => {
    // Kiểm tra ngay lập tức
    checkPaymentStatus();

    // Thiết lập Polling
    const interval = setInterval(() => {
      // Chỉ poll nếu vẫn đang pending
      setStatus((currentStatus) => {
        if (currentStatus === "pending") {
          checkPaymentStatus();
        } else {
          clearInterval(interval); // Dừng poll khi đã có kết quả
        }
        return currentStatus;
      });
    }, 3000); // 3 giây một lần

    // Dừng polling sau 30 giây
    const timeout = setTimeout(() => {
      clearInterval(interval);
      setStatus((currentStatus) => {
        if (currentStatus === "pending") {
          setMessage("Không thể xác nhận thanh toán. Vui lòng kiểm tra lại sau.");
          return "failed";
        }
        return currentStatus;
      });
    }, 30000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [checkPaymentStatus]);

  const renderIcon = () => {
    if (status === "paid") {
      return (
        <CheckCircle className="w-16 h-16 text-green-500 animate-pulse" />
      );
    }
    if (status === "failed") {
      return <XCircle className="w-16 h-16 text-red-500" />;
    }
    return (
      <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full" />
    );
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center p-8 bg-white shadow-lg rounded-lg max-w-md">
        <div className="flex justify-center mb-6">{renderIcon()}</div>
        <h1 className="text-2xl font-bold mb-3">
          {status === "paid"
            ? "Thành công!"
            : status === "failed"
            ? "Thất bại!"
            : "Đang xử lý..."}
        </h1>
        <p className="text-gray-600">{message}</p>
        <button
          onClick={() => navigate(status === "paid" ? "/orders" : "/cart")}
          className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg"
        >
          {status === "paid" ? "Xem đơn hàng" : "Quay về giỏ hàng"}
        </button>
      </div>
    </div>
  );
}