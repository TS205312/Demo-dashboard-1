import { STATUS_BADGE_MAP, STATUS_LABEL_MAP } from '../utils/constants';

export default function OrderHistory({ orders, onSelectOrder, onRefresh }) {
  if (!orders || orders.length === 0) {
    return (
      <div className="glass-card p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <i className="fa-solid fa-clock-rotate-left text-medical-500"></i>
            Lịch sử đơn hàng
          </h2>
          <button
            onClick={onRefresh}
            className="text-xs text-medical-600 hover:text-medical-800 font-medium transition-colors flex items-center gap-1"
          >
            <i className="fa-solid fa-rotate"></i> Làm mới
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
              <tr>
                <td colSpan="5" className="text-center text-sm text-slate-400 py-8">
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
    <div className="glass-card p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <i className="fa-solid fa-clock-rotate-left text-medical-500"></i>
          Lịch sử đơn hàng
        </h2>
        <button
          onClick={onRefresh}
          className="text-xs text-medical-600 hover:text-medical-800 font-medium transition-colors flex items-center gap-1"
        >
          <i className="fa-solid fa-rotate"></i> Làm mới
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
            {displayOrders.map(order => {
              const statusKey = order.status || 'pending';
              const badgeClass = STATUS_BADGE_MAP[statusKey] || 'badge-pending';
              const label = STATUS_LABEL_MAP[statusKey] || 'Chưa xác định';
              const urgencyIcon = order.urgency === 'Cấp cứu khẩn' ? '🚨' : '✅';
              const urgencyClass = order.urgency === 'Cấp cứu khẩn' ? 'text-red-600 font-semibold' : 'text-slate-600';

              return (
                <tr
                  key={order.id}
                  className="cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => onSelectOrder(order.id)}
                >
                  <td className="font-mono text-xs font-semibold text-medical-600">
                    #{order.code || `SAH-${String(order.id).padStart(4, '0')}`}
                  </td>
                  <td className="text-sm font-medium text-slate-700">{order.item || '--'}</td>
                  <td className="text-sm text-slate-600">{order.destination || '--'}</td>
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

