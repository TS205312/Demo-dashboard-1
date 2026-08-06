# Kế hoạch kết nối Giao diện người dùng & SAH Dashboard

## ✅ Hoàn thành toàn bộ

### Backend Server (Express + MongoDB + WebSocket)
- [x] Cấu hình package.json, server.js
- [x] Database models (User, Order, Drone, Mission, MissionLog)
- [x] Routes: auth, orders, drones, missions, gcs
- [x] WebSocket engine (GCS Mission Planner style)
- [x] Auto-progression đơn hàng
- [x] Render deploy config (DEPLOY_GUIDE.md, render.yaml)
- [x] Script chạy/tắt toàn bộ (CHAY_TOAN_BO.bat, TAT_TOAN_BO.bat)

### Kết nối 2 frontend vào Backend
- [x] Giao diện người dùng → gọi API backend thật
- [x] SAH Dashboard → gọi API backend thật
- [x] Command Center hiển thị đơn hàng realtime từ bác sĩ
- [x] Điều phối drone, take off, cập nhật trạng thái

### Sửa lỗi font tiếng Việt (SAH Dashboard)
- [x] Thêm font Be Vietnam Pro (hỗ trợ đầy đủ tiếng Việt)
- [x] Cập nhật CSS variables để dùng font mới

### Thêm trang Đơn hàng cho nhân viên (SAH Dashboard)
- [x] Tạo component OrdersPage.jsx
- [x] Thêm tab "Đơn hàng" vào Dashboard
- [x] Thêm CSS cho trang đơn hàng
- [x] Hiển thị đơn từ bác sĩ
- [x] Tìm kiếm + lọc + tự động cập nhật (poll 5s)

### Kiểm tra
- [x] Build SAH Dashboard thành công (0 lỗi)
