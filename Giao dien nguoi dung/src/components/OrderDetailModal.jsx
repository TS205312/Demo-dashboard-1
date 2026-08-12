import { CheckCircle2, MapPinned, Package } from 'lucide-react';
import Modal from './Modal';
import TrackingMap from './TrackingMap';
import OrderTimeline from './OrderTimeline';
import { STATUS_LABEL_MAP } from '../utils/constants';

/**
 * OrderDetailModal — chi tiết đơn hàng: map + tiến trình + thông tin
 */
export default function OrderDetailModal({ show, onClose, order }) {
  if (!show) return null;

  const statusKey = order?.status || 'pending';
  const destName = order?.destination || '--';
  const code = order?.code || `SAH-${String(order?.id).padStart(4, '0')}`;

  return (
    <Modal show={show} onClose={onClose} title={`Đơn hàng #${code}`} icon={Package} large>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="badge badge-inflight shrink-0">{STATUS_LABEL_MAP[statusKey] || 'Chưa xác định'}</span>
          <span className="inline-flex items-center gap-1.5 text-xs text-ink-muted">
            <MapPinned size={13} className="text-[#67e8f9]" /> {destName}
          </span>
        </div>

        <TrackingMap activeOrder={order} />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="mission-stat">
            <div className="mission-stat__label">Mặt hàng</div>
            <div className="mission-stat__value">{order?.item || '--'}</div>
          </div>
          <div className="mission-stat">
            <div className="mission-stat__label">Mức độ</div>
            <div className="mission-stat__value" style={{ color: order?.urgency === 'Cấp cứu khẩn' ? '#fda4af' : undefined }}>
              {order?.urgency || '--'}
            </div>
          </div>
          <div className="mission-stat">
            <div className="mission-stat__label">Ghi chú</div>
            <div className="mission-stat__value truncate" title={order?.notes || ''}>
              {order?.notes || '--'}
            </div>
          </div>
        </div>

        <OrderTimeline activeOrder={order} />

        {statusKey === 'delivered' && (
          <p className="flex items-center gap-2 rounded-xl border border-[rgba(52,211,153,0.35)] bg-[rgba(52,211,153,0.08)] px-4 py-3 text-sm font-semibold text-[#6ee7b7]">
            <CheckCircle2 size={17} /> Đơn hàng đã giao thành công.
          </p>
        )}
      </div>
    </Modal>
  );
}
