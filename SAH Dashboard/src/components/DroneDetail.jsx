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
            <h4 className="metric-group-title">🎯 PFD - Primary Flight Display</h4>
            <div className="detail-horizon-large">
              <ArtificialHorizon
                pitch={drone.pitch}
                roll={drone.roll}
                size={200}
                armed={drone.armed}
                mode={drone.mode}
                heading={drone.heading}
                airspeed={drone.airspeed}
                altitude={drone.altitude}
              />
            </div>

            {/* Arm/Disarm indicator */}
            <div className="detail-quick-status">
              <div className="quick-status-item">
                <div className={`quick-status-dot ${drone.armed ? 'dot-armed' : 'dot-disarmed'}`} style={{
                  backgroundColor: drone.armed ? '#4CAF50' : '#F44336'
                }} />
                <span style={{ fontWeight: 600, color: drone.armed ? '#4CAF50' : '#F44336' }}>
                  {drone.armed ? '🔒 ARMED' : '🔓 DISARMED'}
                </span>
              </div>
              <div className="quick-status-item">
                <div className="quick-status-dot" style={{ backgroundColor: '#58a6ff' }} />
                <span style={{ fontWeight: 600, color: '#58a6ff' }}>
                  {drone.mode === 'vtol' ? '🛸 VTOL Mode' : '✈️ PLANE Mode'}
                </span>
              </div>
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

        {/* Control buttons bar */}
        <div className="detail-controls">
          <div className="detail-controls-title">🎮 Điều khiển</div>
          <div className="detail-controls-grid">
            <button
              className="ctrl-btn ctrl-continue"
              onClick={() => alert(`✅ ${drone.name}: Tiếp tục bay theo hành trình`)}
              title="Tiếp tục bay theo hành trình đã lập trình"
            >
              <span className="ctrl-icon">▶️</span>
              <span className="ctrl-text">Tiếp tục bay</span>
            </button>

            <button
              className="ctrl-btn ctrl-path"
              onClick={() => alert(`🗺️ ${drone.name}: Đang điều chỉnh đúng hành trình bay`)}
              title="Điều chỉnh drone bay đúng hành trình"
            >
              <span className="ctrl-icon">🗺️</span>
              <span className="ctrl-text">Đúng hành trình</span>
            </button>

            <button
              className="ctrl-btn ctrl-rth"
              onClick={() => alert(`🏠 ${drone.name}: Kích hoạt RTH - Return To Home`)}
              title="Kích hoạt chế độ tự động quay về điểm xuất phát"
            >
              <span className="ctrl-icon">🏠</span>
              <span className="ctrl-text">RTH</span>
              <span className="ctrl-badge">Mất động cơ</span>
            </button>

            <button
              className={`ctrl-btn ctrl-gps ${drone.status === 'offline' ? 'ctrl-pulse' : ''}`}
              onClick={() => alert(`📡 ${drone.name}: Đang phát tín hiệu GPS tìm kiếm...`)}
              title="Phát tín hiệu GPS để định vị máy bay khi mất tín hiệu"
            >
              <span className="ctrl-icon">📡</span>
              <span className="ctrl-text">Phát GPS</span>
              <span className="ctrl-badge">Tìm máy bay</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DroneDetail;

