import { useState, useCallback, useEffect } from 'react';
import { useClock } from './hooks/useClock';
import { useOrders } from './hooks/useOrders';

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
    setActiveOrder,
  } = useOrders();

  const [estTime, setEstTime] = useState('--');
  const [allOrders, setAllOrders] = useState([]);

  // Sync orders from hook to local state for table
  useEffect(() => {
    setAllOrders(orders);
  }, [orders]);

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
    const success = await submitOrder(formData);
    if (success) {
      // Reset form
      const form = document.getElementById('orderForm');
      if (form) form.reset();
      setEstTime('--');
    }
  }, [submitOrder]);

  const handleSelectOrder = useCallback((orderId) => {
    setActiveOrder(orderId);
    setToast({ message: `📋 Đang theo dõi đơn hàng #SAH-${String(orderId).padStart(4, '0')}`, type: 'info' });
  }, [setActiveOrder]);

  const handleRefresh = useCallback(() => {
    setToast({ message: '🔄 Đã làm mới danh sách đơn hàng', type: 'info' });
  }, []);

  return (
    <>
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
              <i className="fa-solid fa-truck-medical text-medical-500"></i>
              Đặt hàng vận chuyển cấp cứu
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">Gửi yêu cầu trực tiếp đến trung tâm điều phối Drone</p>
          </div>
          <div className="text-xs text-slate-400 bg-white px-3 py-1.5 rounded-full border border-slate-200 inline-flex items-center gap-1.5 self-start">
            <i className="fa-regular fa-clock"></i>
            <span>{liveTime}</span>
          </div>
        </div>

        {/* Grid: Form + Map */}
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

          {/* Col 3-5: Map + History */}
          <div className="lg:col-span-3 space-y-6">
            <TrackingMap activeOrder={activeOrder} />
            <OrderHistory
              orders={allOrders}
              onSelectOrder={handleSelectOrder}
              onRefresh={handleRefresh}
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-10 text-center text-xs text-slate-400 border-t border-slate-100 pt-6">
          <p>&copy; 2025 <strong className="text-slate-500">SAH-TECH Medical Drone Logistics</strong>. Tất cả quyền được bảo lưu.</p>
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

