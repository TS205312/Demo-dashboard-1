import { ClipboardList, History, RefreshCw, ShieldCheck, Siren } from 'lucide-react';
import { STATUS_BADGE_MAP, STATUS_LABEL_MAP } from '../utils/constants';
import useReveal from '../hooks/useReveal';

export default function OrderHistory({ orders, onSelectOrder, onRefresh }) {
  const revealRef = useReveal();
  const delayClass = orders && orders.length ? 'zl-reveal--d2' : 'zl-reveal--d1';
  const header = (
    <div className="zl-card__head">
      <h2 className="zl-card__title">
        <History className="zl-card__icon" size={20} />
        Lịch sử đơn hàng
      </h2>
      <button
        onClick={onRefresh}
        className="flex items-center gap-1.5 rounded-full border border-[#cbd5e1] bg-white px-3.5 py-1.5 text-xs font-bold text-[#134e4a] transition-colors hover:bg-[#f0fdfa] hover:border-[#0891b2] hover:text-[#0e7490] cursor-pointer"
      >
        <RefreshCw size={13} /> Làm mới
      </button>
    </div>
  );

  if (!orders || orders.length === 0) {
    return (
      <div className={`zl-card zl-reveal ${delayClass} zl-cover`} ref={revealRef}>
        {header}
        <div className="overflow-x-auto -mx-1">
          <table className="history-table min-w-[480px]">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Mặt hàng</th>
                <th>Điểm nhận</th>
                <th>Mức độ</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="5" className="text-center text-sm text-ink-muted py-8">
                  <ClipboardList size={28} className="mx-auto mb-2 opacity-40" />
                  Chưa có đơn hàng nào. Hãy tạo đơn hàng đầu tiên!
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  const displayOrders = orders.slice(0, 10);

  return (
    <div className={`zl-card zl-reveal ${delayClass} zl-cover`} ref={revealRef}>
      {header}

      <div className="overflow-x-auto -mx-1">
        <table className="history-table min-w-[480px]">
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Mặt hàng</th>
              <th>Điểm nhận</th>
              <th>Mức độ</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {displayOrders.map(order => {
              const statusKey = order.status || 'pending';
              const badgeClass = STATUS_BADGE_MAP[statusKey] || 'badge-pending';
              const label = STATUS_LABEL_MAP[statusKey] || 'Chưa xác định';
              const isUrgent = order.urgency === 'Cấp cứu khẩn';
              const urgencyClass = isUrgent ? 'text-danger font-semibold' : 'text-ink-soft';

              return (
                <tr
                  key={order.id}
                  className="transition-colors"
                  onClick={() => onSelectOrder(order.id)}
                >
                  <td className="font-mono text-xs font-bold text-[#0891b2]">
                    #{order.code || `SAH-${String(order.id).padStart(4, '0')}`}
                  </td>
                  <td className="text-sm font-semibold text-ink">{order.item || '--'}</td>
                  <td className="text-sm text-ink-soft">{order.destination || '--'}</td>
                  <td className={`text-sm inline-flex items-center gap-1 ${urgencyClass}`}>
                    {isUrgent ? <Siren size={14} /> : <ShieldCheck size={14} />} {order.urgency || '--'}
                  </td>
                  <td><span className={`badge ${badgeClass}`}>{label}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
