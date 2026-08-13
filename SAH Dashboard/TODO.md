# SAH Drone Command Center — Liquid Glass Rebuild

## ✅ Setup
- [x] Install `tailwindcss v4`, `@tailwindcss/vite`, `lucide-react`

## 🎨 Configuration
- [x] Update `vite.config.js` to add `@tailwindcss/vite` plugin
- [x] Update `src/index.css` to import Tailwind v4 and define design tokens (colors, fonts)
- [x] Update `index.html` to add Google Fonts (Inter + JetBrains Mono)
- [x] Remove Font Awesome CDN → dùng `lucide-react` toàn bộ

## 🧩 Rebuild toàn bộ giao diện theo liquid glass
- [x] `LoginRegister.jsx` + `login.css` — auth card glass, lucide icons
- [x] `Dashboard.jsx` + `dashboard.css` — shell, KPI chips, header tabs, glass grid + map
- [x] `DroneCard.jsx` — glass card + lucide
- [x] `DroneDetail.jsx` — glass modal + lucide control buttons
- [x] `MapView.jsx` — restyle SVG map, giữ nguyên geocode logic
- [x] `OrdersPage.jsx` — glass table, KPI chips, filter pills, lucide
- [x] `CommandCenter.jsx` — bỏ emoji, thay alert placeholder bằng lucide

## 🧪 Verify
- [x] Run `npm run build` to confirm no errors
- [x] Run `npm run lint` (0 errors)
- [x] Start dev server & confirm — http://localhost:5174/ (HTTP 200)
