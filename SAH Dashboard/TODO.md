# TODO: Kết nối CommandCenter từ Drone Card

## Steps:

- [x] 1. **App.jsx** - Thêm state `showCommandCenter` và `selectedDroneForCommandCenter`
  - Import CommandCenter component
  - Thêm state quản lý
  - Render CommandCenter khi showCommandCenter = true
  - Truyền callback `onOpenCommandCenter(drone)` xuống Dashboard

- [x] 2. **Dashboard.jsx** - Sửa `handleDroneClick` để mở CommandCenter
  - Khi click drone card → chuyển tab sang 'commandcenter'
  - Giữ nguyên MapView và các chức năng khác

- [x] 3. **Kiểm tra** - Verify biên dịch và luồng điều hướng
  - ✅ `npm run build` thành công, không có lỗi
  - ✅ Click drone card → chuyển tab sang CommandCenter
  - ✅ Nút "Fleet Dashboard" → quay lại Fleet tab
  - ⚠️ Warning nhẹ về dynamic import trong MapView.jsx (có sẵn từ trước)
