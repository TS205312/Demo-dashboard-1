import { useEffect, useRef } from 'react';
import { DEFAULT_CENTER, HOSPITAL_POS, DESTINATIONS, STATUS_LABEL_MAP } from '../utils/constants';

export default function TrackingMap({ activeOrder }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const droneMarkerRef = useRef(null);
  const hospitalMarkerRef = useRef(null);
  const destinationMarkerRef = useRef(null);

  useEffect(() => {
    // Chỉ khởi tạo map một lần
    if (mapInstanceRef.current) return;
    if (!window.L) return;

    const L = window.L;

    const tileUrl = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
    const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>';

    const map = L.map(mapRef.current, {
      center: DEFAULT_CENTER,
      zoom: 14,
      zoomControl: true,
      scrollWheelZoom: true,
      attributionControl: true,
    });

    L.tileLayer(tileUrl, {
      attribution,
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    mapInstanceRef.current = map;

    // Hospital marker
    const hospIcon = L.divIcon({
      html: '<div style="background:#2563EB;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:16px;box-shadow:0 2px 12px rgba(37,99,235,0.4);border:2px solid #fff;"><i class="fa-solid fa-hospital"></i></div>',
      className: '',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -20],
    });

    const hospMarker = L.marker(HOSPITAL_POS, { icon: hospIcon })
      .addTo(map)
      .bindPopup(`
        <div style="text-align:center;font-weight:600;font-size:13px;">
          🏥 SAH-TECH Hub<br>
          <span style="font-weight:400;color:#64748B;font-size:11px;">Trung tâm điều phối Drone</span>
        </div>
      `);
    hospitalMarkerRef.current = hospMarker;

    // Drone marker
    const droneIcon = L.divIcon({
      html: '<div class="drone-marker-icon">🛸</div>',
      className: '',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -20],
    });

    const droneM = L.marker(HOSPITAL_POS, { icon: droneIcon, zIndexOffset: 1000 })
      .addTo(map)
      .bindPopup(`
        <div style="text-align:center;font-weight:600;font-size:13px;">
          🛸 Drone SAH-0000<br>
          <span style="font-weight:400;color:#64748B;font-size:11px;">Đang chờ</span>
        </div>
      `);
    droneM.setOpacity(0);
    droneMarkerRef.current = droneM;

    // Fit bounds
    map.fitBounds([
      [HOSPITAL_POS[0] - 0.02, HOSPITAL_POS[1] - 0.02],
      [HOSPITAL_POS[0] + 0.02, HOSPITAL_POS[1] + 0.02]
    ]);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update map khi activeOrder thay đổi
  useEffect(() => {
    if (!mapInstanceRef.current || !droneMarkerRef.current) return;
    const map = mapInstanceRef.current;
    const droneM = droneMarkerRef.current;
    const L = window.L;

    if (!activeOrder) {
      droneM.setOpacity(0);
      if (destinationMarkerRef.current) {
        map.removeLayer(destinationMarkerRef.current);
        destinationMarkerRef.current = null;
      }
      return;
    }

    const destName = activeOrder.destination || 'Bệnh viện Chợ Rẫy';
    const destPos = DESTINATIONS[destName] || DEFAULT_CENTER;

    // Remove old destination marker
    if (destinationMarkerRef.current) {
      map.removeLayer(destinationMarkerRef.current);
    }

    // Add destination marker
    const destIcon = L.divIcon({
      html: '<div style="background:#10B981;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;box-shadow:0 2px 10px rgba(16,185,129,0.4);border:2px solid #fff;"><i class="fa-solid fa-flag-checkered"></i></div>',
      className: '',
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -16],
    });

    const destMarker = L.marker(destPos, { icon: destIcon })
      .addTo(map)
      .bindPopup(`
        <div style="text-align:center;font-weight:600;font-size:13px;">
          📍 ${destName}<br>
          <span style="font-weight:400;color:#64748B;font-size:11px;">Điểm nhận hàng</span>
        </div>
      `);
    destinationMarkerRef.current = destMarker;

    // Determine drone position based on status
    let dronePos;
    const status = activeOrder.status || 'pending';

    if (status === 'delivered') {
      dronePos = destPos;
      droneM.setOpacity(1);
    } else if (status === 'inflight' || status === 'departed') {
      const progress = activeOrder._progress || 0.3;
      dronePos = [
        HOSPITAL_POS[0] + (destPos[0] - HOSPITAL_POS[0]) * progress,
        HOSPITAL_POS[1] + (destPos[1] - HOSPITAL_POS[1]) * progress,
      ];
      droneM.setOpacity(1);
    } else {
      dronePos = HOSPITAL_POS;
      droneM.setOpacity(status === 'packaging' || status === 'pending' ? 0.6 : 0);
    }

    droneM.setLatLng(dronePos);

    // Update popup content
    const popup = droneM.getPopup();
    if (popup) {
      const content = `
        <div style="text-align:center;font-weight:600;font-size:13px;">
          🛸 Drone ${activeOrder.code || `SAH-${String(activeOrder.id).padStart(4, '0')}`}<br>
          <span style="font-weight:400;color:#64748B;font-size:11px;">${STATUS_LABEL_MAP[status] || 'Đang chờ'}</span>
        </div>
      `;
      popup.setContent(content);
    }

    // Fit bounds
    const bounds = L.latLngBounds([HOSPITAL_POS, destPos]);
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });

  }, [activeOrder]);

  return (
    <div className="glass-card p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <i className="fa-solid fa-map-location-dot text-medical-500"></i>
          Bản đồ theo dõi Drone
        </h2>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-slate-500">
            <span className="w-2.5 h-2.5 rounded-full bg-medical-600 inline-block"></span>
            Bệnh viện
          </span>
          <span className="flex items-center gap-1.5 text-slate-500">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block pulse-blue"></span>
            Drone
          </span>
        </div>
      </div>
      <div id="trackingMap" ref={mapRef}></div>
      <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
        <span><i className="fa-regular fa-circle-check text-emerald-500 mr-1"></i> Điểm xuất phát: SAH-TECH Hub</span>
        <span id="droneStatusText">
          {activeOrder ? (
            <>
              {(activeOrder.status === 'delivered' ? '✅' : (activeOrder.status === 'inflight' || activeOrder.status === 'departed') ? '🛸' : '⏳')}
              {' '}Drone: {STATUS_LABEL_MAP[activeOrder.status] || 'Chưa khởi tạo'}
            </>
          ) : (
            '🛸 Drone: Chưa khởi tạo'
          )}
        </span>
      </div>
    </div>
  );
}

