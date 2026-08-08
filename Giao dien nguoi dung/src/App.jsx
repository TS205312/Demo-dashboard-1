import { useState, useCallback } from 'react';
import { useClock } from './hooks/useClock';
import { useOrders } from './hooks/useOrders';

import DoctorAuth from './components/DoctorAuth';
import Navbar from './components/Navbar';
import OrderForm from './components/OrderForm';
import OrderTimeline from './components/OrderTimeline';
import TrackingMap from './components/TrackingMap';
import OrderHistory from './components/OrderHistory';
import SuccessModal from './components/SuccessModal';
import Toast from './components/Toast';

import './App.css';

function App() {
  const liveTime = useClock();
  const [user, setUser] = useState(() => {
    // Khôi phục phiên đăng nhập từ localStorage
    try {
      const saved = localStorage.getItem('sah_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState('create'); // 'create' | 'track' | 'history'

  const {
    orders,
    activeOrder,
    isSubmitting,
    toast,
    showSuccessModal,
    successOrderCode,
    submitOrder,
    closeModal,
    clearToast,
    setToast,
    setActiveOrder,
  } = useOrders();

  const [estTime, setEstTime] = useState('--');

  const handleLogin = useCallback((userData) => {
    setUser(userData);
  }, []);

  const handleLogout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('sah_current_user');
    // Clear form state
    const form = document.getElementById('orderForm');
    if (form) form.reset();
    setEstTime('--');
  }, []);

  const handleUrgencyChange = useCallback((e) => {
    const urgency = e.target.value;
    if (!urgency) {
      setEstTime('--');
      return;
    }
    const mins = urgency === 'Cấp cứu khẩn' ? 15 : 60;
    const now = new Date();
    now.setMinutes(now.getMinutes() + mins);
    const timeStr = now.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const minLabel = urgency === 'Cấp cứu khẩn' ? '15 phút' : '60 phút';
    setEstTime(`${minLabel} (dự kiến ${timeStr})`);
  }, []);

  const handleSubmit = useCallback(async (formData) => {
    const success = await submitOrder(formData, user);
    if (success) {
      // Reset form
      const form = document.getElementById('orderForm');
      if (form) form.reset();
      setEstTime('--');
    }
  }, [submitOrder, user]);

  const handleSelectOrder = useCallback((orderId) => {
    setActiveOrder(orderId);
    setActiveTab('track');
    setToast({ message: `📋 Đang theo dõi đơn hàng #SAH-${String(orderId).padStart(4, '0')}`, type: 'info' });
  }, [setActiveOrder, setToast]);

  const handleRefresh = useCallback(() => {
    setToast({ message: '🔄 Đã làm mới danh sách đơn hàng', type: 'info' });
  }, [setToast]);

  // Nếu chưa đăng nhập → hiển thị trang đăng nhập bác sĩ
  if (!user) {
    return <DoctorAuth onLogin={handleLogin} />;
  }

  const renderTabBar = () => (
    <div className="zl-tabbar" role="tablist">
      <button
        className={`zl-tab ${activeTab === 'create' ? 'active' : ''}`}
        onClick={() => setActiveTab('create')}
        role="tab"
        aria-selected={activeTab === 'create'}
      >
        <i className="fa-solid fa-clipboard-list"></i> Tạo đơn
      </button>
      <button
        className={`zl-tab ${activeTab === 'track' ? 'active' : ''}`}
        onClick={() => setActiveTab('track')}
        role="tab"
        aria-selected={activeTab === 'track'}
      >
        <i className="fa-solid fa-map-location-dot"></i> Theo dõi
      </button>
      <button
        className={`zl-tab ${activeTab === 'history' ? 'active' : ''}`}
        onClick={() => setActiveTab('history')}
        role="tab"
        aria-selected={activeTab === 'history'}
      >
        <i className="fa-solid fa-clock-rotate-left"></i> Lịch sử
      </button>
    </div>
  );

  return (
    <>
      <Navbar user={user} onLogout={handleLogout} />

      {/* Zipline-style hero band */}
      <header className="zl-hero">
        <div className="zl-hero__inner max-w-[1440px] mx-auto">
          <h1 className="zl-display">
            <span className="zl-hero__line"><span>Đặt hàng vận chuyển</span></span>
            <span className="zl-hero__line"><span style={{ color: '#8b5cf6' }}>cấp cứu</span></span>
          </h1>
          <p className="zl-hero__sub">
            Gửi yêu cầu trực tiếp đến trung tâm điều phối Drone SAH-TECH.
            Giao nhanh, chính xác và đúng lúc — như chính bạn đang bay.
          </p>
          <div className="zl-hero__chip">
            <i className="fa-regular fa-clock"></i>
            <span>{liveTime}</span>
          </div>
        </div>
        <svg className="zl-hero__wave" viewBox="0 0 1448 200" preserveAspectRatio="none" aria-hidden="true">
          <path d="M1447.8,0c-2.6,8.9-9.2,16.6-19.9,19.7l-505.5,147c-129.7,37.7-267.2,37.7-396.9,0L20.1,19.7h.1C9.5,16.6,2.9,8.8.3,0h-.3v199.7h1448V0h-.2Z"></path>
        </svg>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Bar */}
        {renderTabBar()}

        {/* Tab Content */}
        <div className="tab-content-enter" key={activeTab}>
          {activeTab === 'create' && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
              {/* Col 1-2: Order Form */}
              <div className="lg:col-span-2 space-y-6">
                <OrderForm
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                  onUrgencyChange={handleUrgencyChange}
                  estTime={estTime}
                />
              </div>

              {/* Col 3-5: Map + Timeline */}
              <div className="lg:col-span-3 space-y-6">
                <TrackingMap activeOrder={activeOrder} />
                <OrderTimeline activeOrder={activeOrder} />
              </div>
            </div>
          )}

          {activeTab === 'track' && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-3 space-y-6">
                <TrackingMap activeOrder={activeOrder} />
              </div>
              <div className="lg:col-span-2 space-y-6">
                <OrderTimeline activeOrder={activeOrder} />
                <OrderHistory
                  orders={orders}
                  onSelectOrder={handleSelectOrder}
                  onRefresh={handleRefresh}
                />
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="max-w-4xl mx-auto">
              <OrderHistory
                orders={orders}
                onSelectOrder={handleSelectOrder}
                onRefresh={handleRefresh}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="zl-footer">
          <p>&copy; 2025 <strong>SAH-TECH Medical Drone Logistics</strong>. Tất cả quyền được bảo lưu.</p>
          <p className="mt-1">
            Hệ thống vận chuyển y tế khẩn cấp bằng Drone &mdash;
            <span className="zl-footer-accent font-semibold"> Vì sức khỏe cộng đồng</span>
          </p>
        </footer>
      </main>

      {/* Success Modal */}
      <SuccessModal
        show={showSuccessModal}
        orderCode={successOrderCode}
        onClose={closeModal}
      />

      {/* Toast */}
      <Toast
        message={toast?.message}
        type={toast?.type}
        onClose={clearToast}
      />
    </>
  );
}

export default App;
