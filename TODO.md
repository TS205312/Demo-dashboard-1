# Kế hoạch kết nối giao diện người dùng và SAH Dashboard

## ✅ Đã hoàn thành

### Backend Server (Express + MongoDB + WebSocket)
- [x] package.json & cấu hình
- [x] database.js - Khởi tạo MongoDB + seed data
- [x] server.js - Express server + WebSocket
- [x] routes/auth.js - Đăng nhập/Đăng ký (có OTP công ty)
- [x] routes/orders.js - CRUD đơn hàng (dùng chung User UI + Dashboard)
- [x] routes/drones.js - Drone + Telemetry
- [x] routes/missions.js - Quản lý mission bay (state machine)
- [x] routes/gcs.js - GCS engine status
- [x] websocket.js - Real-time WebSocket engine
- [x] models/User.js, Order.js, Drone.js, Mission.js, MissionLog.js

### Giao diện người dùng (User Interface)
- [x] utils/api.js - Gọi REST backend thật (tạo đơn, lấy danh sách)
- [x] utils/constants.js - Cập nhật API_BASE, WS_URL
- [x] hooks/useOrders.js - WebSocket real-time, gọi API thật, pass created_by
- [x] App.jsx - Clean code, fix all eslint errors
- [x] Navbar.jsx - Hiển thị tên bác sĩ đã đăng nhập, nút đăng xuất

### SAH Dashboard
- [x] data/api.js - Đầy đủ API client (login, register, orders, drones, missions)
- [x] LoginRegister.jsx - Đăng nhập/đăng ký backend, OTP công ty (SAH2025)
- [x] Dashboard.jsx - Load drones từ backend, Command Center từ backend
- [x] CommandCenter.jsx - Lấy orders thật, tạo mission, sync trạng thái

### Deploy & DevOps
- [x] Root package.json - fix lỗi Render deploy
- [x] render.yaml - rootDir: backend
- [x] CHAY_TOAN_BO.bat, TAT_TOAN_BO.bat
- [x] DEPLOY_GUIDE.md
- [x] PR: blackboxai/fix-render-deploy

### Xác minh
- [x] Backend server chạy, REST API hoạt động
- [x] Giao diện người dùng build thành công
- [x] SAH Dashboard build thành công
- [x] Đăng nhập admin/số lượng drone seed
- [x] Tạo đơn hàng từ User UI → Dashboard thấy được
- [x] WebSocket real-time sync
