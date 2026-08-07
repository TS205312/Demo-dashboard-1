# SAH Drone Command Center — Liquid Glass UI Redesign

## Goal
Redesign the Drone Command Center (CommandCenter) as a Futuristic/SaaS "liquid glass" dashboard with Tailwind CSS v4 + lucide-react, keeping Leaflet map and all backend/flight-simulation logic intact.

## Steps

- [x] 1. Install dependencies: `tailwindcss`, `@tailwindcss/vite`, `lucide-react`
- [x] 2. Configure Tailwind v4 plugin in `vite.config.js`
- [x] 3. Set up global Tailwind theme + liquid glass custom utilities in `src/index.css`
- [x] 4. Add Google Fonts (Inter + JetBrains Mono) + Leaflet/FontAwesome in `index.html`
- [x] 5. Rewrite `src/components/CommandCenter.jsx` with liquid glass layout:
  - Header (brand, KPI chips, phase badge, clock, alert popover)
  - 70/30 workspace (left map panel + HUD overlays, right side panel)
  - Vehicle card, telemetry grid, battery, quick actions, fleet rail, mission queue
  - Dispatch modal, alarm state glow, log terminal
  - Keep flight state machine, Leaflet map wiring, audio engine, sparklines, logs, backend sync
- [x] 6. Rewrite `src/styles/commandCenter.css` with liquid glass styling:
  - Frosted glass panels (backdrop-filter blur/saturate)
  - Vibrant animated gradient backdrop + aurora
  - Radar sweep / beam scan overlays on map
  - KPI chips, pill controls, responsive breakpoints (1100px/900px)
- [x] 7. Verify build (`npm run build`) passes without errors
- [x] 8. Run dev server & visually confirm rendering

## Notes
- Leaflet loaded via CDN in `index.html` (global `window.L`)
- Font Awesome kept for map popups / legacy compatibility
- Tailwind v4 uses `@import "tailwindcss"` + `@theme` (no tailwind.config needed)
- Custom utilities defined via `@utility` in `index.css`
