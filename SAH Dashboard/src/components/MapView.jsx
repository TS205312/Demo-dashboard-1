import { useState, useEffect, useCallback } from 'react';
import { reverseGeocode } from '../data/api';

function MapView({ drones, selectedDrone, onDroneClick }) {
  const [locationNames, setLocationNames] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);

  const mapBounds = {
    latMin: 10.70, latMax: 10.90,
    lngMin: 106.55, lngMax: 106.75,
  };

  const mapWidth = 100;
  const mapHeight = 100;

  const toMapPosition = (lat, lng) => {
    const x = ((lng - mapBounds.lngMin) / (mapBounds.lngMax - mapBounds.lngMin)) * mapWidth;
    const y = ((mapBounds.latMax - lat) / (mapBounds.latMax - mapBounds.latMin)) * mapHeight;
    return { x: Math.min(Math.max(x, 2), mapWidth - 2), y: Math.min(Math.max(y, 2), mapHeight - 2) };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return '#4CAF50';
      case 'warning': return '#FF9800';
      case 'offline': return '#F44336';
      default: return '#888';
    }
  };

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

  const gridLines = [];
  for (let i = 0; i <= 4; i++) {
    const y = (mapHeight / 4) * i;
    const x = (mapWidth / 4) * i;
    gridLines.push(
      <line key={`h-${i}`} x1={0} y1={y} x2={mapWidth} y2={y} stroke="#333" strokeWidth="0.5" />
    );
    gridLines.push(
      <line key={`v-${i}`} x1={x} y1={0} x2={x} y2={mapHeight} stroke="#333" strokeWidth="0.5" />
    );
  }

  return (
    <div className="map-container">
      <div className="map-header">
        <h3 className="map-title">🗺️ Bản đồ vị trí Drone</h3>
        <div className="map-search">
          <input
            type="text"
            className="map-search-input"
            placeholder="Tìm địa điểm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button className="map-search-btn" onClick={handleSearch}>🔍</button>
        </div>
      </div>

      {showSearch && searchResults.length > 0 && (
        <div className="map-search-results">
          {searchResults.map((r, i) => (
            <div
              key={i}
              className="map-search-result-item"
              onClick={() => {
                setSearchQuery(r.label);
                setShowSearch(false);
              }}
            >
              📍 {r.label}
            </div>
          ))}
        </div>
      )}
      {showSearch && searchResults.length === 0 && searchQuery && (
        <div className="map-search-results">
          <div className="map-search-result-item no-result">Không tìm thấy kết quả</div>
        </div>
      )}

      <div className="map-wrapper">
        <svg
          viewBox={`0 0 ${mapWidth} ${mapHeight}`}
          className="map-svg"
          preserveAspectRatio="xMidYMid meet"
        >
          <rect x={0} y={0} width={mapWidth} height={mapHeight} fill="#1a2332" rx="2" />
          {gridLines}
          <text x={2} y={6} fill="#555" fontSize="2.5" fontFamily="monospace">Khu vực Bắc</text>
          <text x={2} y={mapHeight - 2} fill="#555" fontSize="2.5" fontFamily="monospace">Khu vực Nam</text>

          {drones.map((drone) => {
            const pos = toMapPosition(drone.gps.lat, drone.gps.lng);
            const isSelected = selectedDrone && selectedDrone.id === drone.id;
            const color = getStatusColor(drone.status);
            const location = locationNames[drone.id];

            return (
              <g
                key={drone.id}
                className="drone-marker"
                onClick={() => onDroneClick(drone)}
                style={{ cursor: 'pointer' }}
              >
                {drone.status === 'online' && (
                  <circle
                    cx={pos.x} cy={pos.y}
                    r={isSelected ? 6 : 4}
                    fill="none" stroke={color}
                    strokeWidth="0.4" opacity="0.4"
                  >
                    <animate attributeName="r" values="3;7;3" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}
                <circle
                  cx={pos.x} cy={pos.y}
                  r={isSelected ? 3 : 2}
                  fill={color}
                  stroke={isSelected ? '#fff' : 'none'}
                  strokeWidth="0.5"
                />
                <text
                  x={pos.x} y={pos.y - 4}
                  textAnchor="middle"
                  fill={isSelected ? '#fff' : '#aaa'}
                  fontSize="2.5" fontFamily="monospace"
                  fontWeight={isSelected ? 'bold' : 'normal'}
                >
                  {drone.name}
                </text>
                {location && (
                  <text
                    x={pos.x} y={pos.y + 4}
                    textAnchor="middle" fill="#8b949e"
                    fontSize="2" fontFamily="monospace"
                  >
                    {location.length > 18 ? location.substring(0, 16) + '..' : location}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {selectedDrone && (
        <div className="map-coords-info">
          <span>📍 {selectedDrone.name}: </span>
          <span className="coord-value">{selectedDrone.gps.lat.toFixed(4)}, {selectedDrone.gps.lng.toFixed(4)}</span>
          {locationNames[selectedDrone.id] && (
            <span className="coord-location"> - {locationNames[selectedDrone.id]}</span>
          )}
        </div>
      )}

      <div className="map-legend">
        <div className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: '#4CAF50' }}></span>
          <span>Online</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: '#FF9800' }}></span>
          <span>Warning</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: '#F44336' }}></span>
          <span>Offline</span>
        </div>
        <div className="legend-item" style={{ color: '#8b949e', fontSize: '10px' }}>
          <span>🌐</span>
          <span>PositionStack</span>
        </div>
      </div>
    </div>
  );
}

export default MapView;
