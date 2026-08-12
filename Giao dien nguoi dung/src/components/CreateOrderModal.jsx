import { ClipboardList } from 'lucide-react';
import Modal from './Modal';
import OrderForm from './OrderForm';

/**
 * CreateOrderModal — tạo đơn hàng mới trong modal
 */
export default function CreateOrderModal({
  show,
  onClose,
  onSubmit,
  isSubmitting,
  onUrgencyChange,
  estTime,
}) {
  return (
    <Modal show={show} onClose={onClose} title="Tạo đơn vận chuyển" icon={ClipboardList} large>
      <OrderForm
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        onUrgencyChange={onUrgencyChange}
        estTime={estTime}
      />
    </Modal>
  );
}
