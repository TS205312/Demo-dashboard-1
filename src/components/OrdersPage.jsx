import { useState, useEffect, useCallback } from 'react';
import { apiFetchOrders } from '../data/api';

// Map backend status to display label & class
const STATUS_CONFIG = {
  pending:   { label: 'Chờ xử lý',   cls: 'pending' },
  packaging: { label: 'Đang đóng gói', cls: 'packaging' },
  departed:  { label: 'Đã cất cánh', cls: 'departed' },
  inflight:  { label: 'Đang bay',     cls: 'inflight' },
  delivered: { label: 'Đã giao',      cls: 'delivered' },
  cancelled: { label: 'Đã huỷ',       cls: 'cancelled' },
};

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | pending | delivered | cancelled
  const [search, setSearch] = useState('');

  // Load orders from backend
  const loadOrders = useCallback(async () => {
    const data = await apiFetchOrders();
    if (data && data.length) {
      setOrders(data);
    } else {
      setOrders([]);
    }
    setLoading(false);
  }, []);

useEffect(() => {
    // Defer initial load to avoid calling setState synchronously within the effect
    const initialLoad = setTimeout(loadOrders, 0);
    // Poll every 5s for real-time updates from User Interface
    const interval = setInterval(loadOrders, 5000);
    return () => {
      clearTimeout(initialLoad);
      clearInterval(interval);
    };
  }, [loadOrders]);

  // Filter logic
  const filteredOrders = orders.filter(o => {
    // Status filter
    if (filter !== 'all' && o.status !== filter) return false;
    // Search filter (code, item, doctor, destination)
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const code = (o.code || '').toLowerCase();
      const item = (o.medical_item || o.item || '').toLowerCase();
      const doctor = (o.created_by && o.created_by.name || '').toLowerCase();
      const dest = (o.destination || '').toLowerCase();
      if (!code.includes(q) && !item.includes(q) && !doctor.includes(q) && !dest.includes(q)) {
        return false;
      }
    }
    return true;
  });

  // Stats
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    inflight: orders.filter(o => ['departed', 'inflight', 'packaging'].includes(o.status)).length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  const formatTime = (iso) => {
    if (!iso) return '--';
    try {
      return new Date(iso).toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: false,
      });
    } catch {
      return '--';
    }
  };

  const getStatus = (status) => STATUS_CONFIG[status] || { label: status || '--', cls: 'pending' };

  return (
    <div className="orders-page">
      {/* Stats bar */}
      <div className="stats-bar">
        <div className="stat-item stat-total">
          <span className="stat-number">{stats.total}</span>
          <span className="stat-label">Tổng đơn</span>
        </div>
        <div className="stat-item stat-online">
          <span className="stat-number">{stats.pending}</span>
          <span className="stat-label">Chờ xử lý</span>
        </div>
        <div className="stat-item stat-warning">
          <span className="stat-number">{stats.inflight}</span>
          <span className="stat-label">Đang vận chuyển</span>
        </div>
        <div className="stat-item stat-delivered">
          <span className="stat-number">{stats.delivered}</span>
          <span className="stat-label">Đã giao</span>
        </div>
        <div className="stat-item stat-offline">
          <span className="stat-number">{stats.cancelled}</span>
          <span className="stat-label">Đã huỷ</span>
        </div>
      </div>

      {/* Controls */}
      <div className="orders-controls">
        <div className="drone-list-header orders-header">
          <h2 className="section-title">
            <i className="fa-solid fa-clipboard-list" style={{ marginRight: 6 }}></i>
            Tất cả đơn hàng từ bác sĩ
          </h2>
          <div className="orders-filter-group">
            <div className="map-search">
              <input
                type="text"
                className="map-search-input orders-search"
                placeholder="Tìm mã đơn, y phẩm, bác sĩ..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <i className="fa-solid fa-magnifying-glass orders-search-icon"></i>
            </div>
            <div className="filter-buttons">
              {['all', 'pending', 'departed', 'delivered', 'cancelled'].map((f) => (
                <button
                  key={f}
                  className={`filter-btn ${filter === f ? 'active' : ''}`}
                  onClick={() => setFilter(f)}
                >
                  {f === 'all' ? 'Tất cả' : STATUS_CONFIG[f]?.label || f}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="orders-table-wrap">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Bác sĩ</th>
              <th>Y phẩm</th>
              <th>Điểm nhận</th>
              <th>Mức độ</th>
              <th>Drone</th>
              <th>Thời gian đặt</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="orders-empty">
                  <span className="spinner"></span>
                  <p>Đang tải dữ liệu đơn hàng...</p>
                </td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="8" className="orders-empty">
                  <i className="fa-regular fa-folder-open"></i>
                  <p>Không có đơn hàng nào{search ? ' phù hợp' : ''}</p>
                </td>
              </tr>
            ) : (
              filteredOrders.map(order => {
                const st = getStatus(order.status);
                const doctor = (order.created_by && (order.created_by.name || order.created_by.email)) || '--';
                const drone = (order.assigned_drone_id && order.assigned_drone_id.name) || '--';
                const urgent = order.urgency === 'Cấp cứu khẩn';
                return (
                  <tr key={order._id || order.id}>
                    <td className="orders-code">#{order.code}</td>
                    <td className="orders-doctor">
                      <i className="fa-solid fa-user-doctor" style={{ marginRight: 4, color: '#58a6ff' }}></i>
                      {doctor}
                    </td>
                    <td>{order.medical_item || order.item || '--'}</td>
                    <td>{order.destination || '--'}</td>
                    <td>
                      <span className={urgent ? 'orders-urgent' : 'orders-normal'}>
                        {urgent ? '🚨 ' : '✅ '}{order.urgency || 'Bình thường'}
                      </span>
                    </td>
                    <td>{drone}</td>
                    <td className="orders-time">
                      <i className="fa-regular fa-clock" style={{ marginRight: 4 }}></i>
                      {formatTime(order.createdAt)}
                    </td>
                    <td>
                      <span className={`orders-status orders-status-${st.cls}`}>{st.label}</span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default OrdersPage;
