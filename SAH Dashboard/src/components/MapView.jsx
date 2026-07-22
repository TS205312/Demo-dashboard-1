function MapView({ drones, selectedDrone, onDroneClick }) {
  // Map boundaries (approximate area around Ho Chi Minh City)
  const mapBounds = {
    latMin: 10.70,
    latMax: 10.90,
    lngMin: 106.55,
    lngMax: 106.75,
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

  // Generate grid lines for the map
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
      <h3 className="map-title">🗺️ Bản đồ vị trí Drone</h3>
      <div className="map-wrapper">
        <svg
          viewBox={`0 0 ${mapWidth} ${mapHeight}`}
          className="map-svg"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Map background */}
          <rect x={0} y={0} width={mapWidth} height={mapHeight} fill="#1a2332" rx="2" />

          {/* Grid lines */}
          {gridLines}

          {/* Map labels */}
          <text x={2} y={6} fill="#555" fontSize="2.5" fontFamily="monospace">HCMC North</text>
          <text x={2} y={mapHeight - 2} fill="#555" fontSize="2.5" fontFamily="monospace">HCMC South</text>

          {/* Drone markers */}
          {drones.map((drone) => {
            const pos = toMapPosition(drone.gps.lat, drone.gps.lng);
            const isSelected = selectedDrone && selectedDrone.id === drone.id;
            const color = getStatusColor(drone.status);

            return (
              <g
                key={drone.id}
                className="drone-marker"
                onClick={() => onDroneClick(drone)}
                style={{ cursor: 'pointer' }}
              >
                {/* Pulse ring for online drones */}
                {drone.status === 'online' && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isSelected ? 6 : 4}
                    fill="none"
                    stroke={color}
                    strokeWidth="0.4"
                    opacity="0.4"
                  >
                    <animate
                      attributeName="r"
                      values="3;7;3"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.6;0;0.6"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}

                {/* Drone dot */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isSelected ? 3 : 2}
                  fill={color}
                  stroke={isSelected ? '#fff' : 'none'}
                  strokeWidth="0.5"
                />

                {/* Drone name label */}
                <text
                  x={pos.x}
                  y={pos.y - 4}
                  textAnchor="middle"
                  fill={isSelected ? '#fff' : '#aaa'}
                  fontSize="2.5"
                  fontFamily="monospace"
                  fontWeight={isSelected ? 'bold' : 'normal'}
                >
                  {drone.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
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
      </div>
    </div>
  );
}

export default MapView;

