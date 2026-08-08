import { STATUS_BADGE_MAP, STATUS_LABEL_MAP } from '../utils/constants';
import useReveal from '../hooks/useReveal';

export default function OrderHistory({ orders, onSelectOrder, onRefresh }) {
  const revealRef = useReveal();
  const delayClass = orders && orders.length ? 'zl-reveal--d2' : 'zl-reveal--d1';
  const header = (
    <div className="zl-card__head">
      <h2 className="zl-card__title">
        <i className="fa-solid fa-clock-rotate-left zl-card__icon"></i>
        Lịch sử đơn hàng
      </h2>
      <button
        onClick={onRefresh}
        className="flex items-center gap-1.5 rounded-full border border-black px-3.5 py-1.5 text-xs font-bold text-black transition-colors hover:bg-black hover:text-white"
      >
        <i className="fa-solid fa-rotate"></i> Làm mới
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
                  <i className="fa-regular fa-rectangle-list text-2xl mb-2 block"></i>
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
              const urgencyIcon = order.urgency === 'Cấp cứu khẩn' ? '🚨' : '✅';
              const urgencyClass = order.urgency === 'Cấp cứu khẩn' ? 'text-danger font-semibold' : 'text-ink-soft';

              return (
                <tr
                  key={order.id}
                  className="cursor-pointer transition-colors"
                  onClick={() => onSelectOrder(order.id)}
                >
                  <td className="font-mono text-xs font-bold text-violet">
                    #{order.code || `SAH-${String(order.id).padStart(4, '0')}`}
                  </td>
                  <td className="text-sm font-semibold text-ink">{order.item || '--'}</td>
                  <td className="text-sm text-ink-soft">{order.destination || '--'}</td>
                  <td className={`text-sm ${urgencyClass}`}>{urgencyIcon} {order.urgency || '--'}</td>
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
