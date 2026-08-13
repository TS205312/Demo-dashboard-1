/* global L */
import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, MapPin, Globe } from 'lucide-react';
import { reverseGeocode } from '../data/api';

const DEFAULT_CENTER = [10.762, 106.666];

function MapView({ drones, selectedDrone, onDroneClick }) {
  const [locationNames, setLocationNames] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);

  const mapNodeRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});
  const clickRef = useRef(onDroneClick);

  useEffect(() => {
    clickRef.current = onDroneClick;
  }, [onDroneClick]);

  // ---- Leaflet map instance -------------------------------------------------
  useEffect(() => {
    if (typeof L === 'undefined' || !mapNodeRef.current || mapRef.current) return;

    const map = L.map(mapNodeRef.current, {
      zoomControl: true,
      attributionControl: true,
    }).setView(DEFAULT_CENTER, 12);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current = {};
    };
  }, []);

  // ---- Sync drone markers ---------------------------------------------------
  useEffect(() => {
    const map = mapRef.current;
    if (!map || typeof L === 'undefined') return;

    const seen = new Set();

    drones.forEach((drone) => {
      seen.add(drone.id);
      const isSelected = selectedDrone && selectedDrone.id === drone.id;
      const status = ['online', 'warning', 'offline'].includes(drone.status) ? drone.status : 'offline';
      const location = locationNames[drone.id];

      const icon = L.divIcon({
        className: '',
        iconSize: [13, 13],
        iconAnchor: [6, 6],
        html:
          `<div class="drone-pin drone-pin--${status}${isSelected ? ' drone-pin--selected' : ''}">` +
          (status === 'online' ? '<span class="drone-pin__ring"></span>' : '') +
          '<span class="drone-pin__dot"></span>' +
          `<span class="drone-pin__label">${drone.name}</span>` +
          '</div>',
      });

      const popup =
        `<div class="map-popup-title">${drone.name}</div>` +
        `<div class="map-popup-meta">${location || `${drone.gps.lat.toFixed(4)}, ${drone.gps.lng.toFixed(4)}`}</div>` +
        `<div class="map-popup-meta">Pin ${drone.battery}% · Cao độ ${drone.altitude} m</div>`;

      const existing = markersRef.current[drone.id];
      if (existing) {
        existing.setLatLng([drone.gps.lat, drone.gps.lng]);
        existing.setIcon(icon);
        existing.setPopupContent(popup);
      } else {
        const marker = L.marker([drone.gps.lat, drone.gps.lng], { icon })
          .addTo(map)
          .bindPopup(popup);
        marker.on('click', () => clickRef.current(drone));
        markersRef.current[drone.id] = marker;
      }
    });

    Object.keys(markersRef.current).forEach((id) => {
      if (!seen.has(id)) {
        map.removeLayer(markersRef.current[id]);
        delete markersRef.current[id];
      }
    });
  }, [drones, selectedDrone, locationNames]);

  // ---- Pan to the selected drone -------------------------------------------
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedDrone) return;
    map.flyTo([selectedDrone.gps.lat, selectedDrone.gps.lng], Math.max(map.getZoom(), 14), {
      duration: 0.8,
    });
  }, [selectedDrone]);

  // ---- Reverse geocoding (unchanged API usage) ------------------------------
  useEffect(() => {
    let cancelled = false;
    const fetchLocations = async () => {
      const names = {};
      for (const drone of drones) {
        if (drone.status === 'offline') {
          names[drone.id] = 'Offline';
          continue;
        }
        try {
          const result = await reverseGeocode(drone.gps.lat, drone.gps.lng);
          if (!cancelled && result) {
            names[drone.id] = result.city || result.name || result.label;
          } else if (!cancelled) {
            names[drone.id] = `${drone.gps.lat.toFixed(2)}, ${drone.gps.lng.toFixed(2)}`;
          }
        } catch {
          if (!cancelled) names[drone.id] = `${drone.gps.lat.toFixed(2)}, ${drone.gps.lng.toFixed(2)}`;
        }
      }
      if (!cancelled) setLocationNames(names);
    };
    fetchLocations();
    return () => { cancelled = true; };
  }, [drones]);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    try {
      const { forwardGeocode } = await import('../data/api');
      const results = await forwardGeocode(searchQuery);
      setSearchResults(results);
      setShowSearch(true);
    } catch (err) {
      console.error('Search error:', err);
    }
  }, [searchQuery]);

  const handleSelectResult = (result) => {
    setSearchQuery(result.label);
    setShowSearch(false);
    const map = mapRef.current;
    if (map && result.lat != null && result.lng != null) {
      map.flyTo([result.lat, result.lng], 14, { duration: 0.8 });
    }
  };

  return (
    <div className="map-container">
      <div className="map-header">
        <h3 className="map-title">
          <MapPin size={15} color="var(--accent)" />
          Bản đồ vị trí Drone
        </h3>
        <div className="map-search">
          <input
            type="text"
            className="map-search-input"
            placeholder="Tìm địa điểm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button className="map-search-btn" onClick={handleSearch} aria-label="Tìm kiếm địa điểm">
            <Search size={14} />
          </button>

          {showSearch && searchResults.length > 0 && (
            <div className="map-search-results">
              {searchResults.map((r, i) => (
                <div
                  key={i}
                  className="map-search-result-item"
                  onClick={() => handleSelectResult(r)}
                >
                  <MapPin size={12} /> {r.label}
                </div>
              ))}
            </div>
          )}
          {showSearch && searchResults.length === 0 && searchQuery && (
            <div className="map-search-results">
              <div className="map-search-result-item no-result">Không tìm thấy kết quả</div>
            </div>
          )}
        </div>
      </div>

      <div className="map-wrapper" ref={mapNodeRef} />

      <div className="map-footer">
        {selectedDrone ? (
          <div className="map-coords-info">
            <MapPin size={12} />
            <span>{selectedDrone.name}</span>
            <span className="coord-value">
              {selectedDrone.gps.lat.toFixed(4)}, {selectedDrone.gps.lng.toFixed(4)}
            </span>
            {locationNames[selectedDrone.id] && (
              <span className="coord-location">· {locationNames[selectedDrone.id]}</span>
            )}
          </div>
        ) : (
          <div className="map-coords-info">
            <Globe size={12} />
            <span className="coord-location">Chọn một drone để xem toạ độ</span>
          </div>
        )}

        <div className="map-legend">
          <span className="legend-item">
            <span className="legend-dot legend-dot--online" /> Online
          </span>
          <span className="legend-item">
            <span className="legend-dot legend-dot--warning" /> Warning
          </span>
          <span className="legend-item">
            <span className="legend-dot legend-dot--offline" /> Offline
          </span>
        </div>
      </div>
    </div>
  );
}

export default MapView;
