import ArtificialHorizon from './ArtificialHorizon';

function DroneCard({ drone, onClick, isSelected }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return '#4CAF50';
      case 'warning': return '#FF9800';
      case 'offline': return '#F44336';
      default: return '#888';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'online': return 'Online';
      case 'warning': return 'Warning';
      case 'offline': return 'Offline';
      default: return 'Unknown';
    }
  };

  const batteryColor = drone.battery > 60 ? '#4CAF50' : drone.battery > 25 ? '#FF9800' : '#F44336';

  return (
    <div
      className={`drone-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onClick(drone)}
    >
      <div className="drone-card-header">
        <div className="drone-name">{drone.name}</div>
        <span
          className="drone-status"
          style={{
            backgroundColor: getStatusColor(drone.status),
            color: '#fff',
            padding: '2px 8px',
            borderRadius: '10px',
            fontSize: '11px',
            fontWeight: 600,
          }}
        >
          {getStatusText(drone.status)}
        </span>
      </div>

      <div className="drone-card-body">
        <div className="drone-card-left">
          {/* Temperature */}
          <div className="drone-metric">
            <i className="metric-icon fa-regular fa-temperature-high"></i>
            <div className="metric-data">
              <span className="metric-value">{drone.temperature}°C</span>
              <span className="metric-label">Nhiệt độ</span>
            </div>
          </div>

          {/* GPS */}
          <div className="drone-metric">
            <i className="metric-icon fa-regular fa-location-dot"></i>
            <div className="metric-data">
              <span className="metric-value">{drone.gps.lat.toFixed(2)}, {drone.gps.lng.toFixed(2)}</span>
              <span className="metric-label">GPS</span>
            </div>
          </div>

          {/* Distance */}
          <div className="drone-metric">
            <i className="metric-icon fa-regular fa-route"></i>
            <div className="metric-data">
              <span className="metric-value">{drone.distance} km</span>
              <span className="metric-label">Quãng đường</span>
            </div>
          </div>

          {/* Wind Speed */}
          <div className="drone-metric">
            <i className="metric-icon fa-regular fa-wind"></i>
            <div className="metric-data">
              <span className="metric-value">{drone.windSpeed} km/h</span>
              <span className="metric-label">Tốc độ gió</span>
            </div>
          </div>

          {/* Battery */}
          <div className="drone-metric">
            <i className="metric-icon fa-regular fa-battery-three-quarters"></i>
            <div className="metric-data">
              <div className="battery-bar-container">
                <div
                  className="battery-bar"
                  style={{
                    width: `${drone.battery}%`,
                    backgroundColor: batteryColor,
                  }}
                />
              </div>
              <span className="metric-value" style={{ color: batteryColor }}>
                {drone.battery}%
              </span>
              <span className="metric-label">Pin</span>
            </div>
          </div>
        </div>

        <div className="drone-card-right">
          {/* Arm/Disarm badge */}
          <div className={`arm-badge ${drone.armed ? 'armed' : 'disarmed'}`}>
            {drone.armed ? 'ARM' : 'DIS'}
          </div>
          {/* Mode badge */}
          <div className={`mode-badge ${drone.mode}`}>
            {drone.mode === 'vtol' ? 'VTOL' : 'PLANE'}
          </div>
          <div className="horizon-thumbnail">
            <ArtificialHorizon
              pitch={drone.pitch}
              roll={drone.roll}
              size={80}
              armed={drone.armed}
              mode={drone.mode}
              heading={drone.heading}
              airspeed={drone.airspeed}
              altitude={drone.altitude}
            />
          </div>
          <div className="drone-altitude">
            <i className="metric-icon fa-regular fa-arrow-up-from-bracket"></i>
            <span className="metric-value">{drone.altitude}m</span>
            <span className="metric-label">Độ cao</span>
          </div>
        </div>
      </div>

      {/* Click hint */}
      <div className="drone-card-footer">
        <span className="click-hint">Nhấp để xem chi tiết</span>
      </div>
    </div>
  );
}

export default DroneCard;

