import { useState } from 'react';
import DroneCommandView from './DroneCommandView';
import CommandCenter from './CommandCenter';
import '../styles/DroneStatusPage.css';

function DroneStatusPage({ drone, onBackToFleet, drones }) {
  const [activeView, setActiveView] = useState('command'); // 'command' | 'advanced'

  return (
    <div className="dsp-container">
      {/* Tab navigation bar */}
      <div className="dsp-tab-bar">
        <button className="dsp-back-btn" onClick={onBackToFleet} title="Back to Fleet">
          <i className="fa-solid fa-arrow-left"></i>
          <span>Fleet Dashboard</span>
        </button>

        <div className="dsp-tabs">
          <button
            className={`dsp-tab ${activeView === 'command' ? 'active' : ''}`}
            onClick={() => setActiveView('command')}
          >
            <i className="fa-solid fa-gamepad"></i>
            Command
          </button>
          <button
            className={`dsp-tab ${activeView === 'advanced' ? 'active' : ''}`}
            onClick={() => setActiveView('advanced')}
          >
            <i className="fa-solid fa-sliders"></i>
            Advanced
          </button>
        </div>

        <div className="dsp-drone-badge">
          <span className={`dsp-status-dot ${drone?.status || 'online'}`}></span>
          <span className="dsp-drone-badge-name">{drone?.name || 'Drone'}</span>
        </div>
      </div>

      {/* Content area */}
      <div className="dsp-content">
        {activeView === 'command' ? (
          <DroneCommandView drone={drone} />
        ) : (
          <CommandCenter drones={drones} onBackToFleet={onBackToFleet} />
        )}
      </div>
    </div>
  );
}

export default DroneStatusPage;
