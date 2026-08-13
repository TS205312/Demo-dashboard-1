import { Thermometer, MapPin, Route as RouteIcon, Wind, BatteryCharging, ArrowUpFromLine } from 'lucide-react';
import ArtificialHorizon from './ArtificialHorizon';

const STATUS_TEXT = {
  online: 'Online',
  warning: 'Warning',
  offline: 'Offline',
};

function DroneCard({ drone, onClick, isSelected }) {
  const status = STATUS_TEXT[drone.status] ? drone.status : 'offline';
  const batteryLevel = drone.battery > 60 ? 'high' : drone.battery > 25 ? 'mid' : 'low';

  return (
    <button
      type="button"
      className={`drone-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onClick(drone)}
      aria-pressed={!!isSelected}
    >
      <div className="drone-card__head">
        <div className="drone-card__identity">
          <span className={`status-dot status-dot--${status}`} />
          <span className="drone-name">{drone.name}</span>
        </div>
        <span className={`sah-badge sah-badge--${status}`}>{STATUS_TEXT[status]}</span>
      </div>

      <div className="drone-card__body">
        <div className="drone-card__visual">
          <div className="horizon-thumbnail">
            <ArtificialHorizon
              pitch={drone.pitch}
              roll={drone.roll}
              size={96}
              armed={drone.armed}
              mode={drone.mode}
              heading={drone.heading}
              airspeed={drone.airspeed}
              altitude={drone.altitude}
            />
          </div>
          <div className="drone-card__tags">
            <span className={`arm-badge ${drone.armed ? 'armed' : 'disarmed'}`}>
              {drone.armed ? 'ARM' : 'DISARM'}
            </span>
            <span className={`mode-badge ${drone.mode}`}>
              {drone.mode === 'vtol' ? 'VTOL' : 'PLANE'}
            </span>
          </div>
        </div>

        <div className="drone-card__metrics">
          <div className={`drone-metric drone-metric--wide battery--${batteryLevel}`}>
            <span className="metric-label">
              <BatteryCharging size={12} /> Pin
            </span>
            <div className="battery-row">
              <div className="battery-bar-container">
                <div className="battery-bar" style={{ width: `${drone.battery}%` }} />
              </div>
              <span className="metric-value" style={{ color: 'currentColor' }}>
                {drone.battery}%
              </span>
            </div>
          </div>

          <div className="drone-metric">
            <span className="metric-label">
              <ArrowUpFromLine size={12} /> Độ cao
            </span>
            <span className="metric-value">{drone.altitude} m</span>
          </div>

          <div className="drone-metric">
            <span className="metric-label">
              <Thermometer size={12} /> Nhiệt độ
            </span>
            <span className="metric-value">{drone.temperature}°C</span>
          </div>

          <div className="drone-metric">
            <span className="metric-label">
              <Wind size={12} /> Gió
            </span>
            <span className="metric-value">{drone.windSpeed} km/h</span>
          </div>

          <div className="drone-metric">
            <span className="metric-label">
              <RouteIcon size={12} /> Quãng đường
            </span>
            <span className="metric-value">{drone.distance} km</span>
          </div>

          <div className="drone-metric drone-metric--wide">
            <span className="metric-label">
              <MapPin size={12} /> Toạ độ
            </span>
            <span className="metric-value metric-value--sm">
              {drone.gps.lat.toFixed(4)}, {drone.gps.lng.toFixed(4)}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

export default DroneCard;
