import { X, Play, Map as MapIcon, Home, SatelliteDish } from 'lucide-react';
import ArtificialHorizon from './ArtificialHorizon';

const STATUS_TEXT = {
  online: 'Online',
  warning: 'Warning',
  offline: 'Offline',
};

const OK = 'var(--success)';
const WARN = 'var(--warning)';
const BAD = 'var(--danger)';

function DroneDetail({ drone, onClose }) {
  if (!drone) return null;

  const status = STATUS_TEXT[drone.status] ? drone.status : 'offline';
  const batteryColor = drone.battery > 60 ? OK : drone.battery > 25 ? WARN : BAD;

  return (
    <div className="drone-detail-overlay" onClick={onClose}>
      <div className="drone-detail-panel" onClick={(e) => e.stopPropagation()}>
        <button className="detail-close-btn" onClick={onClose} aria-label="Đóng">
          <X size={16} />
        </button>

        <div className="detail-header">
          <div className="detail-title-row">
            <h2 className="detail-drone-name">{drone.name}</h2>
            <span className={`sah-badge sah-badge--${status}`}>{STATUS_TEXT[status]}</span>
          </div>
          <p className="detail-subtitle">Thông tin chi tiết trạng thái drone</p>
        </div>

        <div className="detail-body">
          {/* Left column - Metrics */}
          <div className="detail-metrics">
            <div className="detail-metric-group">
              <h4 className="metric-group-title">Nhiệt độ & Vị trí</h4>
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
              <h4 className="metric-group-title">Năng lượng & Vận hành</h4>
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
              <h4 className="metric-group-title">Môi trường & Thái độ</h4>
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
            <h4 className="metric-group-title">PFD - Primary Flight Display</h4>
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
                <div className="quick-status-dot" style={{ backgroundColor: drone.armed ? OK : BAD }} />
                <span style={{ fontWeight: 600, color: drone.armed ? OK : BAD }}>
                  {drone.armed ? 'ARMED' : 'DISARMED'}
                </span>
              </div>
              <div className="quick-status-item">
                <div className="quick-status-dot" style={{ backgroundColor: 'var(--info)' }} />
                <span style={{ fontWeight: 600, color: 'var(--info)' }}>
                  {drone.mode === 'vtol' ? 'VTOL Mode' : 'PLANE Mode'}
                </span>
              </div>
              <div className="quick-status-item">
                <div className="quick-status-dot" style={{ backgroundColor: drone.temperature < 40 ? OK : WARN }} />
                <span>Nhiệt độ {drone.temperature < 40 ? 'ổn định' : 'cao'}</span>
              </div>
              <div className="quick-status-item">
                <div className="quick-status-dot" style={{ backgroundColor: drone.windSpeed < 15 ? OK : WARN }} />
                <span>Gió {drone.windSpeed < 15 ? 'nhẹ' : 'mạnh'}</span>
              </div>
              <div className="quick-status-item">
                <div className="quick-status-dot" style={{ backgroundColor: drone.battery > 25 ? OK : BAD }} />
                <span>Pin {drone.battery > 25 ? 'đủ' : 'yếu'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Control buttons bar */}
        <div className="detail-controls">
          <div className="detail-controls-title">Điều khiển</div>
          <div className="detail-controls-grid">
            <button
              className="ctrl-btn ctrl-continue"
              onClick={() => alert(`${drone.name}: Tiếp tục bay theo hành trình`)}
              title="Tiếp tục bay theo hành trình đã lập trình"
            >
              <Play size={16} className="ctrl-icon" />
              <span className="ctrl-text">Tiếp tục bay</span>
            </button>

            <button
              className="ctrl-btn ctrl-path"
              onClick={() => alert(`${drone.name}: Đang điều chỉnh đúng hành trình bay`)}
              title="Điều chỉnh drone bay đúng hành trình"
            >
              <MapIcon size={16} className="ctrl-icon" />
              <span className="ctrl-text">Đúng hành trình</span>
            </button>

            <button
              className="ctrl-btn ctrl-rth"
              onClick={() => alert(`${drone.name}: Kích hoạt RTH - Return To Home`)}
              title="Kích hoạt chế độ tự động quay về điểm xuất phát"
            >
              <Home size={16} className="ctrl-icon" />
              <span className="ctrl-text">RTH</span>
              <span className="ctrl-badge">Mất động cơ</span>
            </button>

            <button
              className={`ctrl-btn ctrl-gps ${drone.status === 'offline' ? 'ctrl-pulse' : ''}`}
              onClick={() => alert(`${drone.name}: Đang phát tín hiệu GPS tìm kiếm...`)}
              title="Phát tín hiệu GPS để định vị máy bay khi mất tín hiệu"
            >
              <SatelliteDish size={16} className="ctrl-icon" />
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
