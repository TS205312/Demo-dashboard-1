import { ClipboardList, RefreshCw, ShieldCheck, Siren } from 'lucide-react';
import { STATUS_BADGE_MAP, STATUS_LABEL_MAP } from '../utils/constants';

/**
 * OrderHistory — bảng lịch sử đơn hàng (content-only, đã được bọc card/modal bên ngoài)
 */
export default function OrderHistory({ orders, onSelectOrder, onRefresh }) {
  if (!orders || orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <ClipboardList size={30} className="mb-3 opacity-30 text-cyan-300" />
        <p className="text-sm font-semibold text-ink-soft">Chưa có đơn hàng nào</p>
        <p className="mt-1 text-xs text-ink-muted">Hãy tạo đơn hàng đầu tiên!</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-xs font-bold text-ink-muted">
          {orders.length} đơn hàng
        </p>
        <button
          onClick={onRefresh}
          className="flex items-center gap-1.5 rounded-full border border-[#24334f] bg-[rgba(13,21,38,0.6)] px-3.5 py-1.5 text-xs font-bold text-ink-soft transition-colors hover:border-[#22d3ee] hover:text-[#67e8f9] cursor-pointer"
        >
          <RefreshCw size={13} /> Làm mới
        </button>
      </div>

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
            {orders.map(order => {
              const statusKey = order.status || 'pending';
              const badgeClass = STATUS_BADGE_MAP[statusKey] || 'badge-pending';
              const label = STATUS_LABEL_MAP[statusKey] || 'Chưa xác định';
              const isUrgent = order.urgency === 'Cấp cứu khẩn';
              const urgencyClass = isUrgent ? 'text-[#fda4af] font-semibold' : 'text-ink-soft';

              return (
                <tr
                  key={order.id}
                  className="transition-colors"
                  onClick={() => onSelectOrder?.(order.id)}
                >
                  <td className="font-mono text-xs font-bold text-[#67e8f9]">
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
