import { useState, useEffect } from 'react';
import { LayoutGrid, TowerControl, ClipboardList, User, LogOut, CalendarDays } from 'lucide-react';
import { apiFetchDrones } from '../data/api';
import DroneCard from './DroneCard';
import DroneDetail from './DroneDetail';
import MapView from './MapView';
import CommandCenter from './CommandCenter';
import OrdersPage from './OrdersPage';
import '../styles/dashboard.css';

function Dashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('fleet'); // 'fleet' | 'commandcenter' | 'orders'
  const [selectedDrone, setSelectedDrone] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [filter, setFilter] = useState('all'); // all | online | warning | offline
  const [dronesData, setDronesData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch drones from backend
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const data = await apiFetchDrones();
      if (!cancelled) {
        setDronesData(data);
        setLoading(false);
      }
    };
    load();
    // Poll every 10s to keep fleet data fresh
    const interval = setInterval(load, 10000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const handleDroneClick = (drone) => {
    setSelectedDrone(drone);
    setActiveTab('commandcenter');
    setShowDetail(false);
  };

  const handleMapDroneClick = (drone) => {
    setSelectedDrone(drone);
    setShowDetail(true);
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
  };

  const filteredDrones = filter === 'all'
    ? dronesData
    : dronesData.filter((d) => d.status === filter);

  const stats = {
    total: dronesData.length,
    online: dronesData.filter((d) => d.status === 'online').length,
    warning: dronesData.filter((d) => d.status === 'warning').length,
    offline: dronesData.filter((d) => d.status === 'offline').length,
  };

  const handleBackToFleet = () => {
    setActiveTab('fleet');
  };

  // Render Fleet tab content
  const renderFleetTab = () => (
    <>
      {/* KPI chips bar */}
      <div className="stats-bar">
        <div className="stat-item stat-total">
          <span className="stat-number">{stats.total}</span>
          <span className="stat-label">Tổng số</span>
        </div>
        <div className="stat-item stat-online">
          <span className="stat-number">{stats.online}</span>
          <span className="stat-label">Online</span>
        </div>
        <div className="stat-item stat-warning">
          <span className="stat-number">{stats.warning}</span>
          <span className="stat-label">Warning</span>
        </div>
        <div className="stat-item stat-offline">
          <span className="stat-number">{stats.offline}</span>
          <span className="stat-label">Offline</span>
        </div>
      </div>

      {/* Main content */}
      <div className="dashboard-main">
        {/* Left side - Drone cards */}
        <div className="drone-list-section">
          <div className="drone-list-header">
            <h2 className="section-title">
              <LayoutGrid size={15} color="var(--accent)" />
              Danh sách Drone
              <span className="section-count">{filteredDrones.length}</span>
            </h2>
            <div className="filter-buttons">
              {['all', 'online', 'warning', 'offline'].map((f) => (
                <button
                  key={f}
                  className={`filter-btn ${filter === f ? 'active' : ''}`}
                  onClick={() => setFilter(f)}
                >
                  {f === 'all' ? 'Tất cả' : f === 'online' ? 'Online' : f === 'warning' ? 'Warning' : 'Offline'}
                </button>
              ))}
            </div>
          </div>
          <div className="drone-grid">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="sah-skeleton skeleton-card" />
              ))
            ) : filteredDrones.length === 0 ? (
              <div className="empty-state">
                <LayoutGrid size={26} />
                <p>Không có drone nào trong bộ lọc này</p>
              </div>
            ) : (
              filteredDrones.map((drone) => (
                <DroneCard
                  key={drone.id}
                  drone={drone}
                  onClick={handleDroneClick}
                  isSelected={selectedDrone && selectedDrone.id === drone.id}
                />
              ))
            )}
          </div>
        </div>

        {/* Right side - Map */}
        <div className="map-section">
          <MapView
            drones={dronesData}
            selectedDrone={selectedDrone}
            onDroneClick={handleMapDroneClick}
          />
        </div>
      </div>

      {/* Detail modal */}
      {showDetail && selectedDrone && (
        <DroneDetail
          drone={selectedDrone}
          onClose={handleCloseDetail}
        />
      )}
    </>
  );

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="sah-logo-glow">
            <img src="/sah-logo.png" alt="SAH-TECH" className="header-logo sah-logo-pulse" />
          </div>
          <div>
            <h1 className="header-title">SAH Drone Dashboard</h1>
            <p className="header-subtitle">Giám sát và điều khiển đội bay</p>
          </div>
        </div>

        {/* Page tabs - same row as logo */}
        <nav className="header-tabs">
          <button
            className={`tab-btn ${activeTab === 'fleet' ? 'active' : ''}`}
            onClick={() => setActiveTab('fleet')}
          >
            <LayoutGrid size={14} /> Fleet
          </button>
          <button
            className={`tab-btn ${activeTab === 'commandcenter' ? 'active' : ''}`}
            onClick={() => setActiveTab('commandcenter')}
          >
            <TowerControl size={14} /> Command Center
          </button>
          <button
            className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <ClipboardList size={14} /> Đơn hàng
          </button>
        </nav>
        <div className="header-right">
          <div className="header-datetime">
            <CalendarDays size={13} />
            {new Date().toLocaleDateString('vi-VN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
          {user && (
            <div className="header-user">
              <span className="header-user-avatar">
                <User size={14} />
              </span>
              <span className="header-user-name">{user.name}</span>
              <button
                className="header-logout-btn"
                onClick={onLogout}
                title="Đăng xuất"
                aria-label="Đăng xuất"
              >
                <LogOut size={14} />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Tab Content */}
      <div className="tab-content-enter" key={activeTab}>
        {activeTab === 'fleet' ? renderFleetTab() : activeTab === 'orders' ? (
          <OrdersPage />
        ) : (
          <CommandCenter drones={dronesData} onBackToFleet={handleBackToFleet} />
        )}
      </div>
    </div>
  );
}

export default Dashboard;
