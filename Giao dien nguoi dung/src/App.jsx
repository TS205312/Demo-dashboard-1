import { useState, useCallback } from 'react';
import { Plus, Rocket } from 'lucide-react';
import { useClock } from './hooks/useClock';
import { useOrders } from './hooks/useOrders';

import DoctorAuth from './components/DoctorAuth';
import Navbar from './components/Navbar';
import CommandCenter from './components/CommandCenter';
import CreateOrderModal from './components/CreateOrderModal';
import OrderDetailModal from './components/OrderDetailModal';
import HistoryModal from './components/HistoryModal';
import AccountModal from './components/AccountModal';
import HeroDrone from './components/HeroDrone';
import BackgroundFX from './components/BackgroundFX';
import ScrollProgress from './components/ScrollProgress';
import SuccessModal from './components/SuccessModal';
import Toast from './components/Toast';

import './App.css';

function App() {
  const liveTime = useClock();
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('sah_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // modal: null | 'create' | 'detail' | 'history' | 'account'
  const [modal, setModal] = useState(null);

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
    setModal(null);
    setEstTime('--');
  }, []);

  const handleUserUpdated = useCallback((userData) => {
    setUser(userData);
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
      const form = document.getElementById('orderForm');
      if (form) form.reset();
      setEstTime('--');
      setModal(null);
    }
  }, [submitOrder, user]);

  const handleSelectOrder = useCallback((orderId) => {
    setActiveOrder(orderId);
    setModal('detail');
    setToast({ message: `📋 Đang xem đơn hàng #SAH-${String(orderId).padStart(4, '0')}`, type: 'info' });
  }, [setActiveOrder, setToast]);

  const handleRefresh = useCallback(() => {
    setToast({ message: '🔄 Đã làm mới danh sách đơn hàng', type: 'info' });
  }, [setToast]);

  const handleOpenCreate = useCallback(() => {
    setModal('create');
  }, []);

  // Chưa đăng nhập → trang đăng nhập bác sĩ
  if (!user) {
    return <DoctorAuth onLogin={handleLogin} />;
  }

  return (
    <>
      <ScrollProgress />
      <BackgroundFX />
      <Navbar
        user={user}
        onLogout={handleLogout}
        onOpenHistory={() => setModal('history')}
        onOpenAccount={() => setModal('account')}
      />

      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CommandCenter
          user={user}
          liveTime={liveTime}
          orders={orders}
          activeOrder={activeOrder}
          onOpenCreate={handleOpenCreate}
          onSelectOrder={handleSelectOrder}
        />

        {/* Footer */}
        <footer className="zl-footer">
          <p>&copy; 2025 <strong>SAH-TECH Medical Drone Logistics</strong>. Tất cả quyền được bảo lưu.</p>
          <p className="mt-1">
            Hệ thống vận chuyển y tế khẩn cấp bằng Drone &mdash;
            <span className="zl-footer-accent font-semibold"> Vì sức khỏe cộng đồng</span>
          </p>
        </footer>
      </main>

      {/* FAB create order */}
      {!modal && (
        <button
          onClick={handleOpenCreate}
          className="cc-fab"
          title="Tạo đơn vận chuyển"
        >
          <Plus size={20} /> Tạo đơn
        </button>
      )}

      {/* Modals */}
      <CreateOrderModal
        show={modal === 'create'}
        onClose={() => setModal(null)}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        onUrgencyChange={handleUrgencyChange}
        estTime={estTime}
      />
      <OrderDetailModal
        show={modal === 'detail'}
        onClose={() => setModal(null)}
        order={activeOrder}
      />
      <HistoryModal
        show={modal === 'history'}
        onClose={() => setModal(null)}
        orders={orders}
        onSelectOrder={handleSelectOrder}
        onRefresh={handleRefresh}
      />
      <AccountModal
        show={modal === 'account'}
        onClose={() => setModal(null)}
        user={user}
        onUpdated={handleUserUpdated}
        onNotify={setToast}
      />

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
