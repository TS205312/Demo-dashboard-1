# SAH Dashboard - Zipline Professional Refactor

## Progress Tracking

- [x] Plan approved
- [x] Step 1: Update App.css - CSS variables, remove scanlines/vignette/grid
- [x] Step 2: Update dashboard.css - Complete rewrite, remove cyberpunk elements
- [x] Step 3: Update commandCenter.css - Complete rewrite, remove cyberpunk elements
- [x] Step 4: Update login.css - Minor refinements
- [x] Step 5: Update Dashboard.jsx - Remove emoji icons, clean up
- [x] Step 6: Update DroneCard.jsx - Remove emoji icons, simplify layout
- [x] Step 7: Update DroneDetail.jsx - Remove emoji icons, simplify controls
- [x] Step 8: Update MapView.jsx - Remove emoji icons, clean up
- [x] Step 9: Update LoginRegister.jsx - Remove emoji icons
- [x] Step 10: Verify build and test

## Debug Fixes (Vercel deployment + lint)

- [x] Fix Vercel VCR docker error via `vercel.json` (build/install/output overrides)
- [x] `src/data/api.js`: default backend URL points to Render backend, allow `VITE_API_URL` override
- [x] `src/components/CommandCenter.jsx`: fix `react-hooks/set-state-in-effect` (defer setState in setTimeout)
- [x] `src/components/OrdersPage.jsx`: fix `react-hooks/set-state-in-effect` (defer `loadOrders()` in setTimeout)
- [x] `src/components/MapView.jsx`: replace dynamic import with static `forwardGeocode` import
- [x] Lint clean (`npx eslint src` exit 0)
- [x] Build passes (`npm run build`)
