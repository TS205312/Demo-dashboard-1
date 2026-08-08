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
    <div className="tab-bar">
      <button
        className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`}
        onClick={() => setActiveTab('create')}
      >
        <i className="fa-solid fa-clipboard-list"></i> Tạo đơn
      </button>
      <button
        className={`tab-btn ${activeTab === 'track' ? 'active' : ''}`}
        onClick={() => setActiveTab('track')}
      >
        <i className="fa-solid fa-map-location-dot"></i> Theo dõi
      </button>
      <button
        className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
        onClick={() => setActiveTab('history')}
      >
        <i className="fa-solid fa-clock-rotate-left"></i> Lịch sử
      </button>
    </div>
  );

  return (
    <>
      <Navbar user={user} onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-ink flex items-center gap-2">
              <i className="fa-solid fa-truck-medical text-medical-500"></i>
              Đặt hàng vận chuyển cấp cứu
            </h1>
            <p className="text-sm text-ink-muted mt-0.5">Gửi yêu cầu trực tiếp đến trung tâm điều phối Drone</p>
          </div>
          <div className="text-xs text-ink-soft bg-white/10 px-3 py-1.5 rounded-full border border-white/15 inline-flex items-center gap-1.5 self-start backdrop-blur-md">
            <i className="fa-regular fa-clock"></i>
            <span>{liveTime}</span>
          </div>
        </div>

        {/* Tab Bar */}
        {renderTabBar()}

        {/* Tab Content */}
        <div className="tab-content-enter py-6" key={activeTab}>
          {activeTab === 'create' && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Col 1-2: Order Form + Timeline */}
              <div className="lg:col-span-2">
                <OrderForm
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                  onUrgencyChange={handleUrgencyChange}
                  estTime={estTime}
                />
                <OrderTimeline activeOrder={activeOrder} />
              </div>

              {/* Col 3-5: Map */}
              <div className="lg:col-span-3 space-y-6">
                <TrackingMap activeOrder={activeOrder} />
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
        <footer className="mt-10 text-center text-xs text-ink-muted border-t border-white/10 pt-6">
          <p>&copy; 2025 <strong className="text-ink-soft">SAH-TECH Medical Drone Logistics</strong>. Tất cả quyền được bảo lưu.</p>
          <p className="mt-0.5">
            Hệ thống vận chuyển y tế khẩn cấp bằng Drone &mdash;
            <span className="text-medical-500"> Vì sức khỏe cộng đồng</span>
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
