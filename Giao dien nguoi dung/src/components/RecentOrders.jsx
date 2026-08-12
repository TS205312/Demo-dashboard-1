import { ClipboardList, MapPin } from 'lucide-react';
import { STATUS_BADGE_MAP, STATUS_LABEL_MAP } from '../utils/constants';

/**
 * RecentOrders — danh sách đơn gần đây dạng compact list
 */
export default function RecentOrders({ orders, onSelectOrder }) {
  if (!orders || orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <ClipboardList size={30} className="mb-3 opacity-30 text-cyan-300" />
        <p className="text-sm font-semibold text-ink-soft">Chưa có đơn hàng nào</p>
        <p className="mt-1 text-xs text-ink-muted">Hãy tạo đơn hàng đầu tiên để bắt đầu!</p>
      </div>
    );
  }

  const list = orders.slice(0, 6);

  return (
    <div className="recent-list">
      {list.map(order => {
        const statusKey = order.status || 'pending';
        const badgeClass = STATUS_BADGE_MAP[statusKey] || 'badge-pending';
        const label = STATUS_LABEL_MAP[statusKey] || 'Chưa xác định';
        const code = order.code || `SAH-${String(order.id).padStart(4, '0')}`;
        const isUrgent = order.urgency === 'Cấp cứu khẩn';

        return (
          <div
            key={order.id}
            className="recent-item"
            onClick={() => onSelectOrder?.(order.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') onSelectOrder?.(order.id);
            }}
          >
            <span className="recent-item__icon">
              <MapPin size={17} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="recent-item__code">#{code}</span>
                {isUrgent && <span className="text-[10px] font-bold text-[#fda4af]">KHẨN</span>}
              </div>
              <p className="recent-item__dest truncate">{order.destination || '--'}</p>
              <p className="recent-item__meta">{order.item || '--'}</p>
            </div>
            <span className={`badge ${badgeClass} shrink-0`}>{label}</span>
          </div>
        );
      })}
    </div>
  );
}
