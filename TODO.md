# Kế hoạch kết nối giao diện người dùng và SAH Dashboard

## ✅ Hoàn thành
- [x] Phân tích kiến trúc 2 ứng dụng
- [x] Lập kế hoạch Backend + Database
- [x] Xác nhận kế hoạch với người dùng
- [x] Tạo Backend Server (Express + MongoDB in-memory + WebSocket)
  - [x] Models: User, Order, Drone (GCS), Mission, MissionLog
  - [x] database.js - MongoDB connect + seed data (admin, 6 drones)
  - [x] server.js - Express + WebSocket + Auto-progression
  - [x] routes/auth.js - Login/Register API
  - [x] routes/orders.js - CRUD orders + WebSocket broadcast
  - [x] routes/drones.js - GCS drones + telemetry
  - [x] routes/missions.js - Mission state machine + logs
  - [x] routes/gcs.js - Ground Control Station endpoints
  - [x] websocket.js - GCS WebSocket engine (drone/dashboard registration, failsafe RTL, heartbeat)
- [x] Cập nhật Giao diện người dùng
  - [x] utils/api.js - Gọi REST backend
  - [x] utils/constants.js - API_BASE + WS_URL
  - [x] hooks/useOrders.js - WebSocket real-time
- [x] Cập nhật SAH Dashboard
  - [x] data/api.js - API client đầy đủ
  - [x] components/LoginRegister.jsx - Dùng backend auth
- [x] Server hoạt động ổn định
  - [x] MongoDB in-memory auto-start
  - [x] Health check OK
  - [x] Auth (login/register) OK
  - [x] Orders CRUD OK
  - [x] Drones list OK
  - [x] Auto-progression: pending → delivered OK

## 🚀 Server đang chạy tại
- **REST API**: http://localhost:3001/api
- **WebSocket**: ws://localhost:3001/ws
- **Health**: http://localhost:3001/api/health

## 📝 Tài khoản mặc định
- **Admin**: admin@sah.tech / admin123
