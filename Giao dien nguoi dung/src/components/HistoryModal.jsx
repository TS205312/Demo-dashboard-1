import { History } from 'lucide-react';
import Modal from './Modal';
import OrderHistory from './OrderHistory';

/**
 * HistoryModal — lịch sử đơn hàng đầy đủ
 */
export default function HistoryModal({ show, onClose, orders, onSelectOrder, onRefresh }) {
  return (
    <Modal show={show} onClose={onClose} title="Lịch sử đơn hàng" icon={History} large>
      <OrderHistory orders={orders} onSelectOrder={onSelectOrder} onRefresh={onRefresh} />
    </Modal>
  );
}
