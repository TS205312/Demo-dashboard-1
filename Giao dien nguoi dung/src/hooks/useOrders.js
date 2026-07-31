import { useState, useEffect, useCallback, useRef } from 'react';
import { apiCreateOrder, apiFetchOrders } from '../utils/api';
import { STATUS_TO_STEP } from '../utils/constants';
import { WS_URL } from '../utils/constants';

/**
 * Hook quản lý orders kết nối đến Backend qua REST + WebSocket
 */
export function useOrders() {
  const [orders, setOrders] = useState([]);
  const [activeOrderId, setActiveOrderId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successOrderCode, setSuccessOrderCode] = useState('');
  const wsRef = useRef(null);

  // Load orders từ Backend khi mount
  useEffect(() => {
    const load = async () => {
      const fetched = await apiFetchOrders();
      if (fetched && fetched.length > 0) {
        setOrders(fetched);
        // Set active order to most recent non-delivered
        const latest = fetched.find(o => o.status !== 'delivered') || fetched[0];
        if (latest) {
          setActiveOrderId(latest.id);
        }
      }
    };
    load();
  }, []);

  // WebSocket kết nối real-time
  useEffect(() => {
    let reconnectTimeout;

    function connectWebSocket() {
      try {
        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('[WS] Đã kết nối đến server');
        };

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);

            switch (msg.type) {
              case 'new_order':
                // Có đơn hàng mới từ server (khi user khác tạo)
                setOrders(prev => [msg.data, ...prev]);
                break;

              case 'order_status_update':
                // Cập nhật trạng thái từ Command Center
                setOrders(prev =>
                  prev.map(order =>
                    order.id === msg.data.id ? { ...order, ...msg.data } : order
                  )
                );
                break;

              case 'connection':
                console.log('[WS]', msg.data.message);
                break;

              case 'heartbeat':
              case 'pong':
                break;

              default:
                break;
            }
          } catch (e) {
            // ignore parse errors
          }
        };

        ws.onclose = () => {
          console.log('[WS] Mất kết nối, sẽ thử lại trong 3s...');
          reconnectTimeout = setTimeout(connectWebSocket, 3000);
        };

        ws.onerror = (err) => {
          console.error('[WS] Lỗi:', err.message);
          ws.close();
        };
      } catch (err) {
        console.error('[WS] Không thể kết nối:', err.message);
        reconnectTimeout = setTimeout(connectWebSocket, 5000);
      }
    }

    connectWebSocket();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []);

  // Submit đơn hàng
  const submitOrder = useCallback(async (formData) => {
    if (isSubmitting) return false;
    setIsSubmitting(true);

    try {
      const payload = {
        medical_item: formData.get('medicalItem'),
        destination: formData.get('destination'),
        urgency: formData.get('urgency'),
        notes: formData.get('notes') || '',
      };

      const result = await apiCreateOrder(payload);

      if (result.success) {
        const order = result.data;
        setOrders(prev => [order, ...prev]);
        setActiveOrderId(order.id);
        setSuccessOrderCode(order.code || `#SAH-${String(order.id).padStart(4, '0')}`);
        setShowSuccessModal(true);
        setToast({ message: `✅ Đơn hàng ${order.code} đã được gửi đến trung tâm điều phối!`, type: 'success' });
        return true;
      }
      return false;
    } catch (err) {
      setToast({ message: '❌ Lỗi khi gửi đơn hàng. Vui lòng thử lại.', type: 'error' });
      console.error('Submit error:', err);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting]);

  // Đóng modal
  const closeModal = useCallback(() => {
    setShowSuccessModal(false);
  }, []);

  // Clear toast
  const clearToast = useCallback(() => {
    setToast(null);
  }, []);

  // Set active order
  const setActiveOrder = useCallback((orderId) => {
    setActiveOrderId(orderId);
  }, []);

  // Lấy active order
  const activeOrder = orders.find(o => o.id === activeOrderId) || null;

  // Lấy timeline step từ active order
  const getTimelineStep = useCallback(() => {
    if (!activeOrder) return 'received';
    return STATUS_TO_STEP[activeOrder.status] || 'received';
  }, [activeOrder]);

  return {
    orders,
    activeOrder,
    activeOrderId,
    isSubmitting,
    toast,
    showSuccessModal,
    successOrderCode,
    submitOrder,
    closeModal,
    clearToast,
    setActiveOrder,
    getTimelineStep,
    setOrders,
  };
}

