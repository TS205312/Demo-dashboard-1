import ArtificialHorizon from './ArtificialHorizon';

function DroneDetail({ drone, onClose }) {
  if (!drone) return null;

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
    <div className="drone-detail-overlay" onClick={onClose}>
      <div className="drone-detail-panel" onClick={(e) => e.stopPropagation()}>
        <button className="detail-close-btn" onClick={onClose}>✕</button>

        <div className="detail-header">
          <div className="detail-title-row">
            <h2 className="detail-drone-name">{drone.name}</h2>
            <span
              className="detail-status"
              style={{
                backgroundColor: getStatusColor(drone.status),
                color: '#fff',
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              {getStatusText(drone.status)}
            </span>
          </div>
          <p className="detail-subtitle">Thông tin chi tiết trạng thái drone</p>
        </div>

        <div className="detail-body">
          {/* Left column - Metrics */}
          <div className="detail-metrics">
            <div className="detail-metric-group">
              <h4 className="metric-group-title">🌡️ Nhiệt độ & Vị trí</h4>
              <div className="detail-metric">
                <span className="detail-metric-label">Nhiệt độ</span>
                <span className="detail-metric-value">{drone.temperature}°C</span>
              </div>
              <div className="detail-metric">
                <span className="detail-metric-label">GPS Latitude</span>
                <span className="detail-metric-value">{drone.gps.lat}</span>
              </div>
              <div className="detail-metric">
                <span className="detail-metric-label">GPS Longitude</span>
                <span className="detail-metric-value">{drone.gps.lng}</span>
              </div>
              <div className="detail-metric">
                <span className="detail-metric-label">Độ cao</span>
                <span className="detail-metric-value">{drone.altitude} m</span>
              </div>
            </div>

            <div className="detail-metric-group">
              <h4 className="metric-group-title">🔋 Năng lượng & Vận hành</h4>
              <div className="detail-metric">
                <span className="detail-metric-label">Pin</span>
                <span className="detail-metric-value" style={{ color: batteryColor }}>
                  {drone.battery}%
                </span>
              </div>
              <div className="detail-metric">
                <span className="detail-metric-label">Quãng đường đã bay</span>
                <span className="detail-metric-value">{drone.distance} km</span>
              </div>
              <div className="detail-metric">
                <span className="detail-metric-label">Giờ bay</span>
                <span className="detail-metric-value">{drone.flightHours} h</span>
              </div>
              <div className="detail-metric">
                <span className="detail-metric-label">Bảo trì cuối</span>
                <span className="detail-metric-value">{drone.lastMaintenance}</span>
              </div>
            </div>

            <div className="detail-metric-group">
              <h4 className="metric-group-title">💨 Môi trường & Thái độ</h4>
              <div className="detail-metric">
                <span className="detail-metric-label">Tốc độ gió</span>
                <span className="detail-metric-value">{drone.windSpeed} km/h</span>
              </div>
              <div className="detail-metric">
                <span className="detail-metric-label">Pitch (Góc nâng)</span>
                <span className="detail-metric-value">{drone.pitch}°</span>
              </div>
              <div className="detail-metric">
                <span className="detail-metric-label">Roll (Góc nghiêng)</span>
                <span className="detail-metric-value">{drone.roll}°</span>
              </div>
            </div>
          </div>

          {/* Right column - Artificial Horizon */}
          <div className="detail-horizon-section">
            <h4 className="metric-group-title">🎯 Artificial Horizon</h4>
            <div className="detail-horizon-large">
              <ArtificialHorizon
                pitch={drone.pitch}
                roll={drone.roll}
                size={200}
              />
            </div>

            {/* Quick status indicators */}
            <div className="detail-quick-status">
              <div className="quick-status-item">
                <div className="quick-status-dot" style={{
                  backgroundColor: drone.temperature < 40 ? '#4CAF50' : '#FF9800'
                }} />
                <span>Nhiệt độ {drone.temperature < 40 ? 'ổn định' : 'cao'}</span>
              </div>
              <div className="quick-status-item">
                <div className="quick-status-dot" style={{
                  backgroundColor: drone.windSpeed < 15 ? '#4CAF50' : '#FF9800'
                }} />
                <span>Gió {drone.windSpeed < 15 ? 'nhẹ' : 'mạnh'}</span>
              </div>
              <div className="quick-status-item">
                <div className="quick-status-dot" style={{
                  backgroundColor: drone.battery > 25 ? '#4CAF50' : '#F44336'
                }} />
                <span>Pin {drone.battery > 25 ? 'đủ' : 'yếu'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DroneDetail;

