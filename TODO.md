# TODO: Debug & Fix SAH Dashboard

## Steps
- [x] 1. Tạo nhánh mới `debug-fixes` từ `master`
- [x] 2. Cập nhật backend URL trong `src/data/api.js` trỏ tới `https://demo-dashboard-1-1.onrender.com/api`
- [x] 3. Sửa lỗi lint `CommandCenter.jsx:460` (react-hooks/set-state-in-effect)
- [x] 4. Sửa lỗi lint `DroneCommandView.jsx:18` (no-unused-vars - biến `temperature`)
- [x] 5. Sửa lỗi lint `OrdersPage.jsx:32` (react-hooks/set-state-in-effect)
- [x] 6. Sửa warning dynamic import trong `MapView.jsx`
- [x] 7. Chạy `npm run lint` xác nhận sạch lỗi
- [x] 8. Chạy `npm run build` xác nhận build thành công
- [x] 9. Commit các thay đổi lên nhánh `debug-fixes`
