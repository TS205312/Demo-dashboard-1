# TODO — Xây lại giao diện người dùng theo mẫu SAH Dashboard (Liquid Glass Dark)

## Mục tiêu
Đập đi và xây lại `Giao dien nguoi dung` theo phong cách **liquid glass dark / iOS style** của `SAH Dashboard`:
- Nền tối gradient + glass card trong suốt
- Text trắng, control pill glass
- Thêm **Tab Bar** (giống Dashboard mẫu) với các tab: Tạo đơn / Theo dõi / Lịch sử
- Giữ nguyên toàn bộ logic & chức năng (API, hooks, WebSocket, Leaflet map, form submit)

## Các bước
- [x] 1. Phân tích cấu trúc 2 project
- [x] 2. Tạo TODO.md
- [x] 3. Cập nhật `src/App.css` — theme dark glass đồng bộ, thêm style tab bar + layout
- [x] 4. Cập nhật `src/App.jsx` — thêm Tab Bar (Tạo đơn / Theo dõi / Lịch sử), đồng bộ màu
- [x] 5. Cập nhật `src/components/Navbar.jsx` — navbar glass tối
- [x] 6. Cập nhật `src/components/OrderForm.jsx` — form glass tối
- [x] 7. Cập nhật `src/components/OrderTimeline.jsx` — timeline text trắng
- [x] 8. Cập nhật `src/components/OrderHistory.jsx` — bảng glass tối
- [x] 9. Cập nhật `src/components/TrackingMap.jsx` — tiêu đề/legend glass tối
- [x] 10. Cập nhật `src/components/SuccessModal.jsx` — modal glass tối
- [x] 11. Cập nhật `src/components/Toast.jsx` — toast glass tối
- [x] 12. Kiểm tra build & chạy thử
