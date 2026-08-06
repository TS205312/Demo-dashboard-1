import { useState, useEffect, useRef } from 'react';
import '../styles/DroneCommandView.css';

function DroneCommandView({ drone }) {
  const [activeMediaTab, setActiveMediaTab] = useState('video');
  const [selectedResolution, setSelectedResolution] = useState('1920:1080');
  const [resolutionPx, setResolutionPx] = useState(8);
  const [heading, setHeading] = useState(drone?.heading || 45);
  const [clock, setClock] = useState('');
  const compassRef = useRef(null);

  // Drone data mapped from props
const droneName = drone?.name || 'DHMR-32000';
  const battery = drone?.battery || 90;
  const altitude = drone?.altitude || 270;
  const speed = drone?.airspeed || 20;
  const distance = drone?.distance || 12;
  const gpsLat = drone?.gps?.lat || 10.8231;
  const gpsLng = drone?.gps?.lng || 106.6297;
  const level = drone?.pitch || 2;
  const droneWeight = 15; // fixed
  const droneHeight = drone?.altitude ? Math.round(drone.altitude * 0.3048) : 80; // approx

  // Live clock
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      setClock(`${h}:${m}`);
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, []);

  // Simulate slow heading drift
  useEffect(() => {
    const iv = setInterval(() => {
      setHeading((prev) => {
        const delta = (Math.random() - 0.5) * 2;
        return ((prev + delta) % 360 + 360) % 360;
      });
    }, 2000);
    return () => clearInterval(iv);
  }, []);

  // Draw compass
  useEffect(() => {
    const canvas = compassRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;
    const radius = Math.min(cx, cy) - 15;

    ctx.clearRect(0, 0, W, H);

    // Background circle
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 8, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(20, 25, 35, 0.85)';
    ctx.fill();

    // Outer ring
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 5, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(100, 120, 150, 0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Tick marks and degree labels
    for (let deg = 0; deg < 360; deg += 10) {
      const rad = ((deg - 90) * Math.PI) / 180;
      const isMajor = deg % 30 === 0;
      const innerR = isMajor ? radius - 14 : radius - 8;
      const outerR = radius;

      ctx.beginPath();
      ctx.moveTo(cx + innerR * Math.cos(rad), cy + innerR * Math.sin(rad));
      ctx.lineTo(cx + outerR * Math.cos(rad), cy + outerR * Math.sin(rad));
      ctx.strokeStyle = isMajor ? 'rgba(200, 220, 255, 0.7)' : 'rgba(100, 120, 150, 0.4)';
      ctx.lineWidth = isMajor ? 1.5 : 0.8;
      ctx.stroke();

      if (isMajor) {
        const labelR = radius - 24;
        ctx.save();
        ctx.font = '10px Inter, sans-serif';
        ctx.fillStyle = 'rgba(180, 200, 220, 0.7)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(deg.toString(), cx + labelR * Math.cos(rad), cy + labelR * Math.sin(rad));
        ctx.restore();
      }
    }

    // Cardinal directions
    const cardinals = [
      { label: 'N', deg: 0, color: '#ff4444' },
      { label: 'E', deg: 90, color: '#aac0d8' },
      { label: 'S', deg: 180, color: '#aac0d8' },
      { label: 'W', deg: 270, color: '#aac0d8' },
    ];
    cardinals.forEach(({ label, deg, color }) => {
      const rad = ((deg - 90) * Math.PI) / 180;
      const labelR = radius + 1;
      ctx.save();
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, cx + labelR * Math.cos(rad), cy + labelR * Math.sin(rad));
      ctx.restore();
    });

    // Heading indicator (red triangle at top)
    const hdgRad = ((heading - 90) * Math.PI) / 180;
    const triR = radius - 35;
    ctx.beginPath();
    ctx.moveTo(cx + (triR + 8) * Math.cos(hdgRad), cy + (triR + 8) * Math.sin(hdgRad));
    ctx.lineTo(
      cx + triR * Math.cos(hdgRad - 0.08),
      cy + triR * Math.sin(hdgRad - 0.08)
    );
    ctx.lineTo(
      cx + triR * Math.cos(hdgRad + 0.08),
      cy + triR * Math.sin(hdgRad + 0.08)
    );
    ctx.closePath();
    ctx.fillStyle = '#e74c3c';
    ctx.fill();

    // Center crosshair
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#ccc';
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx - 10, cy);
    ctx.lineTo(cx + 10, cy);
    ctx.moveTo(cx, cy - 10);
    ctx.lineTo(cx, cy + 10);
    ctx.strokeStyle = 'rgba(200, 220, 255, 0.4)';
    ctx.lineWidth = 0.8;
    ctx.stroke();

  }, [heading]);

  const batteryColor = battery > 60 ? '#10b981' : battery > 25 ? '#f59e0b' : '#ef4444';

  const resolutions = ['1920:1080', '1280:720', '854:480', '640:360'];
  const flightTime = drone?.flightHours
    ? `${Math.floor(drone.flightHours / 60)}:${String(drone.flightHours % 60).padStart(2, '0')}`
    : '12:24';

  const zoneStatus = battery > 50 ? 'Green' : battery > 25 ? 'Yellow' : 'Red';
  const zoneColor = battery > 50 ? '#10b981' : battery > 25 ? '#f59e0b' : '#ef4444';

  return (
    <div className="dcv-container">
      {/* ===== TOP ROW ===== */}
      <div className="dcv-top-row">
        {/* VIDEO FEED PANEL */}
        <div className="dcv-video-panel">
          <div className="dcv-video-feed">
            {/* Video overlay elements */}
            <div className="dcv-video-overlay-top">
              <div className="dcv-hdr-badge">HDR <span className="dcv-rec-dot"></span></div>
              <div className="dcv-video-controls">
                <button className="dcv-vid-btn">⏸</button>
                <span className="dcv-rec-indicator"><span className="dcv-rec-dot-lg"></span> {clock || '02:12'}</span>
              </div>
            </div>
            <div className="dcv-video-res">4K • {(speed).toFixed(1)} FPS</div>

            {/* Level indicator */}
            <div className="dcv-level-indicator">
              <span className="dcv-level-label">Level</span>
              <div className="dcv-level-bar">
                <div className="dcv-level-marker" style={{ left: `${50 + level * 2}%` }}></div>
              </div>
            </div>

            {/* Crosshair */}
            <div className="dcv-crosshair">
              <div className="dcv-crosshair-h"></div>
              <div className="dcv-crosshair-v"></div>
            </div>

            {/* Mode badge */}
            <div className="dcv-mode-badge">KT</div>

            {/* RGBE toggles */}
            <div className="dcv-rgbe-toggles">
              <button className="dcv-channel-btn dcv-ch-r">R <span className="dcv-ch-dot" style={{ background: '#ef4444' }}></span></button>
              <button className="dcv-channel-btn dcv-ch-g">G <span className="dcv-ch-dot" style={{ background: '#10b981' }}></span></button>
              <button className="dcv-channel-btn dcv-ch-b">B <span className="dcv-ch-dot" style={{ background: '#3b82f6' }}></span></button>
              <button className="dcv-channel-btn dcv-ch-e">E <span className="dcv-ch-dot" style={{ background: '#f59e0b' }}></span></button>
            </div>

            {/* Thumbnail strip */}
            <div className="dcv-thumbnail-strip">
              <div className="dcv-thumb active"></div>
              <div className="dcv-thumb"></div>
            </div>

            {/* Simulated video background */}
            <div className="dcv-video-bg"></div>
          </div>
        </div>

        {/* DRONE INFO PANEL */}
        <div className="dcv-info-panel">
          <div className="dcv-info-header">
            <h2 className="dcv-drone-name">{droneName}</h2>
            <div className="dcv-drone-icon">
              <svg viewBox="0 0 64 32" width="64" height="32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="8" y1="8" x2="24" y2="16" stroke="#00d4ff" strokeWidth="1.5"/>
                <line x1="56" y1="8" x2="40" y2="16" stroke="#00d4ff" strokeWidth="1.5"/>
                <line x1="8" y1="24" x2="24" y2="16" stroke="#00d4ff" strokeWidth="1.5"/>
                <line x1="56" y1="24" x2="40" y2="16" stroke="#00d4ff" strokeWidth="1.5"/>
                <rect x="22" y="12" width="20" height="8" rx="2" fill="#00d4ff" opacity="0.3" stroke="#00d4ff" strokeWidth="1"/>
                <circle cx="8" cy="8" r="5" stroke="#00d4ff" strokeWidth="1" fill="none"/>
                <circle cx="56" cy="8" r="5" stroke="#00d4ff" strokeWidth="1" fill="none"/>
                <circle cx="8" cy="24" r="5" stroke="#00d4ff" strokeWidth="1" fill="none"/>
                <circle cx="56" cy="24" r="5" stroke="#00d4ff" strokeWidth="1" fill="none"/>
              </svg>
            </div>
          </div>
          <p className="dcv-info-desc">
            We've increased the range of droplet size from 50 to 500μm
          </p>

          {/* Altitude */}
          <div className="dcv-info-row">
            <span className="dcv-info-label">Altitude limited</span>
            <span className="dcv-info-value">{altitude} <small>MI</small></span>
          </div>
          <div className="dcv-divider dcv-divider-blue"></div>

          {/* Battery */}
          <div className="dcv-info-row">
            <span className="dcv-info-label">Battery status</span>
            <span className="dcv-info-value" style={{ color: batteryColor }}>{battery}%</span>
          </div>
          <div className="dcv-battery-bar">
            <div className="dcv-battery-fill" style={{ width: `${battery}%`, background: batteryColor }}></div>
          </div>

          {/* Level / Height / Weight */}
          <div className="dcv-triple-stats">
            <div className="dcv-triple-stat">
              <span className="dcv-triple-label">Level</span>
              <span className="dcv-triple-value">{level}°</span>
            </div>
            <div className="dcv-triple-stat">
              <span className="dcv-triple-label">Height</span>
              <span className="dcv-triple-value">{droneHeight}m</span>
            </div>
            <div className="dcv-triple-stat">
              <span className="dcv-triple-label">Weight</span>
              <span className="dcv-triple-value">{droneWeight}kg</span>
            </div>
            <div className="dcv-triple-icons">
              <button className="dcv-icon-btn">🔄</button>
              <button className="dcv-icon-btn">📷</button>
            </div>
          </div>

          {/* Resolution slider */}
          <div className="dcv-resolution-section">
            <div className="dcv-info-row">
              <span className="dcv-info-label">Resolution px</span>
              <span className="dcv-info-value">{resolutionPx} <small>px</small></span>
            </div>
            <div className="dcv-resolution-slider">
              <input
                type="range"
                min="2"
                max="10"
                value={resolutionPx}
                onChange={(e) => setResolutionPx(Number(e.target.value))}
                className="dcv-slider"
              />
              <div className="dcv-slider-labels">
                <span>2 px</span>
                <span>4 px</span>
                <span>6 px</span>
                <span>8 px</span>
                <span>10 px</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== BOTTOM ROW ===== */}
      <div className="dcv-bottom-row">
        {/* CAMERA CONTROL PANEL */}
        <div className="dcv-camera-panel">
          {/* Progress bar */}
          <div className="dcv-progress-bar">
            <div className="dcv-progress-fill" style={{ width: '65%' }}></div>
            <div className="dcv-progress-dots">
              {[...Array(12)].map((_, i) => (
                <span key={i} className={`dcv-progress-dot ${i < 8 ? 'active' : ''}`}></span>
              ))}
            </div>
          </div>

          <div className="dcv-camera-content">
            {/* Left side - media toggle + info */}
            <div className="dcv-camera-left">
              {/* Video/Photo toggle */}
              <div className="dcv-media-toggle">
                <button
                  className={`dcv-media-btn ${activeMediaTab === 'video' ? 'active' : ''}`}
                  onClick={() => setActiveMediaTab('video')}
                >
                  🎥 Video
                </button>
                <button
                  className={`dcv-media-btn ${activeMediaTab === 'photo' ? 'active' : ''}`}
                  onClick={() => setActiveMediaTab('photo')}
                >
                  📷 Photo
                </button>
              </div>

              {/* Thumbnail */}
              <div className="dcv-camera-thumb"></div>

              {/* Stats */}
              <div className="dcv-camera-stats">
                <div className="dcv-cam-stat">
                  <span className="dcv-cam-stat-label">Speed</span>
                  <span className="dcv-cam-stat-value">{speed} <small>Km/h</small></span>
                </div>
                <div className="dcv-cam-stat">
                  <span className="dcv-cam-stat-label">Zone</span>
                  <span className="dcv-cam-stat-value" style={{ color: zoneColor }}>● {zoneStatus}</span>
                </div>
                <div className="dcv-cam-stat">
                  <span className="dcv-cam-stat-label">Distance</span>
                  <span className="dcv-cam-stat-value">{distance} <small>Km</small></span>
                </div>
                <div className="dcv-cam-stat">
                  <span className="dcv-cam-stat-label">Flight Time</span>
                  <span className="dcv-cam-stat-value">{flightTime}</span>
                </div>
                <div className="dcv-cam-stat">
                  <span className="dcv-cam-stat-label">ISO</span>
                  <span className="dcv-cam-stat-value">6000</span>
                </div>
                <div className="dcv-cam-stat">
                  <span className="dcv-cam-stat-label">Shutter</span>
                  <span className="dcv-cam-stat-value">180.0</span>
                </div>
              </div>
            </div>

            {/* Center - Frame line + Joystick */}
            <div className="dcv-camera-center">
              <div className="dcv-frame-line-section">
                <span className="dcv-frame-title">Frame Line</span>
                <div className="dcv-frame-options">
                  {resolutions.map((res) => (
                    <button
                      key={res}
                      className={`dcv-frame-btn ${selectedResolution === res ? 'active' : ''}`}
                      onClick={() => setSelectedResolution(res)}
                    >
                      {res}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="dcv-action-btns">
                <button className="dcv-action-btn">AWB</button>
                <button className="dcv-action-btn">DSP</button>
              </div>

              {/* Joystick */}
              <div className="dcv-joystick-area">
                <div className="dcv-joystick-arrows">
                  <button className="dcv-joy-arrow dcv-joy-up">▲</button>
                  <button className="dcv-joy-arrow dcv-joy-left">◀</button>
                  <div className="dcv-joystick-knob">
                    <div className="dcv-joy-inner"></div>
                  </div>
                  <button className="dcv-joy-arrow dcv-joy-right">▶</button>
                  <button className="dcv-joy-arrow dcv-joy-down">▼</button>
                </div>
              </div>

              {/* Resolution chevron */}
              <div className="dcv-chevron-down">⌄</div>
            </div>
          </div>
        </div>

        {/* COMPASS PANEL */}
        <div className="dcv-compass-panel">
          <div className="dcv-compass-coords">
            <span>{gpsLat.toFixed(4)} N, {gpsLng.toFixed(4)} E</span>
          </div>
          <div className="dcv-compass-wrapper">
            <canvas
              ref={compassRef}
              width={220}
              height={220}
              className="dcv-compass-canvas"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DroneCommandView;
