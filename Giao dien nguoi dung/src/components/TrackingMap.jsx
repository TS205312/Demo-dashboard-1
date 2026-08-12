import { useEffect, useRef } from 'react';
import { CheckCircle2, Clock, Drone } from 'lucide-react';
import { DEFAULT_CENTER, HOSPITAL_POS, DESTINATIONS, STATUS_LABEL_MAP } from '../utils/constants';

/**
 * TrackingMap — bản đồ dark (CARTO dark_all) + hub radar sweep + marker drone
 */
export default function TrackingMap({ activeOrder }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const droneMarkerRef = useRef(null);
  const destinationMarkerRef = useRef(null);

  useEffect(() => {
    if (mapInstanceRef.current) return;
    if (!window.L) return;

    const L = window.L;

    const tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
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

    // Hospital marker (dark hub)
    const hospIcon = L.divIcon({
      html: '<div style="background:#22d3ee;width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#04181c;font-size:15px;box-shadow:0 0 0 4px rgba(34,211,238,0.25),0 4px 20px rgba(34,211,238,0.6);border:2px solid #0d1526;"><i class="fa-solid fa-hospital"></i></div>',
      className: '',
      iconSize: [34, 34],
      iconAnchor: [17, 17],
      popupAnchor: [0, -22],
    });

    const hospMarker = L.marker(HOSPITAL_POS, { icon: hospIcon })
      .addTo(map)
      .bindPopup(`
        <div style="text-align:center;font-weight:600;font-size:13px;color:#e6edf7;">
          SAH-TECH Hub<br>
          <span style="font-weight:400;color:#64748c;font-size:11px;">Trung tâm điều phối Drone</span>
        </div>
      `);

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
        <div style="text-align:center;font-weight:600;font-size:13px;color:#e6edf7;">
          Drone SAH-0000<br>
          <span style="font-weight:400;color:#64748c;font-size:11px;">Đang chờ</span>
        </div>
      `);
    droneM.setOpacity(0);
    droneMarkerRef.current = droneM;

    // Radar sweep overlay at hub
    const radar = L.divIcon({
      html: `
        <div class="map-radar">
          <div class="map-radar__sweep"></div>
          <div class="map-radar__ring"></div>
          <div class="map-radar__ring map-radar__ring--2"></div>
          <div class="map-radar__ring map-radar__ring--3"></div>
        </div>
      `,
      className: '',
      iconSize: [120, 120],
      iconAnchor: [60, 60],
    });
    L.marker(HOSPITAL_POS, { icon: radar, interactive: false }).addTo(map);

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

    if (destinationMarkerRef.current) {
      map.removeLayer(destinationMarkerRef.current);
    }

    const destIcon = L.divIcon({
      html: '<div style="background:#34d399;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#04181c;font-size:12px;box-shadow:0 0 0 4px rgba(52,211,153,0.25),0 4px 18px rgba(52,211,153,0.55);border:2px solid #0d1526;"><i class="fa-solid fa-flag-checkered"></i></div>',
      className: '',
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -18],
    });

    const destMarker = L.marker(destPos, { icon: destIcon })
      .addTo(map)
      .bindPopup(`
        <div style="text-align:center;font-weight:600;font-size:13px;color:#e6edf7;">
          ${destName}<br>
          <span style="font-weight:400;color:#64748c;font-size:11px;">Điểm nhận hàng</span>
        </div>
      `);
    destinationMarkerRef.current = destMarker;

    // Drone position theo status
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

    const popup = droneM.getPopup();
    if (popup) {
      popup.setContent(`
        <div style="text-align:center;font-weight:600;font-size:13px;color:#e6edf7;">
          Drone ${activeOrder.code || `SAH-${String(activeOrder.id).padStart(4, '0')}`}<br>
          <span style="font-weight:400;color:#64748c;font-size:11px;">${STATUS_LABEL_MAP[status] || 'Đang chờ'}</span>
        </div>
      `);
    }

    const bounds = L.latLngBounds([HOSPITAL_POS, destPos]);
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
  }, [activeOrder]);

  return (
    <div>
      <div ref={mapRef} style={{ height: '100%', minHeight: '320px', borderRadius: '16px' }}></div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-ink-muted">
        <span>
          <CheckCircle2 size={13} className="text-success mr-1 inline" /> Điểm xuất phát: SAH-TECH Hub
        </span>
        <span id="droneStatusText" className="font-semibold text-ink-soft inline-flex items-center gap-1.5">
          {activeOrder ? (
            <>
              {(activeOrder.status === 'delivered'
                ? <CheckCircle2 size={14} className="text-success" />
                : (activeOrder.status === 'inflight' || activeOrder.status === 'departed')
                  ? <Drone size={14} className="text-[#22d3ee]" />
                  : <Clock size={14} className="text-[#fbbf24]" />)}
              {' '}Drone: {STATUS_LABEL_MAP[activeOrder.status] || 'Chưa khởi tạo'}
            </>
          ) : (
            <>
              <Drone size={14} className="text-[#22d3ee]" /> Drone: Chưa khởi tạo
            </>
          )}
        </span>
      </div>
    </div>
  );
}
