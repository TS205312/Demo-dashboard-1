import { TIMELINE_STEPS, STATUS_TO_STEP, STATUS_BADGE_MAP, STATUS_LABEL_MAP, STEP_LABELS } from '../utils/constants';

export default function OrderTimeline({ activeOrder }) {
  const status = activeOrder?.status || null;
  const stepKey = STATUS_TO_STEP[status] || 'received';
  const currentIdx = TIMELINE_STEPS.indexOf(stepKey);

  const badgeClass = status ? (STATUS_BADGE_MAP[status] || 'badge-pending') : 'badge-pending';
  const badgeText = status ? (STATUS_LABEL_MAP[status] || 'Chưa có đơn') : 'Chưa có đơn';

  return (
    <div className="glass-card p-5 sm:p-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <i className="fa-solid fa-list-check text-medical-500"></i>
          Tiến trình đơn hàng
        </h2>
        <span className={`badge ${badgeClass} text-[11px]`}>{badgeText}</span>
      </div>

      <div className="timeline" id="orderTimeline">
        <div className={`timeline-item${currentIdx >= 0 ? ' active' : ''}${currentIdx > 0 ? ' completed' : ''}`} data-step="received">
          <div className="timeline-dot"><i className="fa-solid fa-check text-[8px]"></i></div>
          <div className="timeline-content">
            <p className="text-sm font-semibold text-slate-700">Đã tiếp nhận</p>
            <p className="text-xs text-slate-400">Hệ thống xác nhận đơn hàng</p>
          </div>
        </div>
        <div className={`timeline-item${currentIdx >= 1 ? ' active' : ''}${currentIdx > 1 ? ' completed' : ''}`} data-step="packaging">
          <div className="timeline-dot"><i className="fa-solid fa-box text-[8px]"></i></div>
          <div className="timeline-content">
            <p className="text-sm font-semibold text-slate-700">Đóng gói</p>
            <p className="text-xs text-slate-400">Kiểm tra & đóng gói hàng hóa y tế</p>
          </div>
        </div>
        <div className={`timeline-item${currentIdx >= 2 ? ' active' : ''}${currentIdx > 2 ? ' completed' : ''}`} data-step="departed">
          <div className="timeline-dot"><i className="fa-solid fa-rocket text-[8px]"></i></div>
          <div className="timeline-content">
            <p className="text-sm font-semibold text-slate-700">Drone cất cánh</p>
            <p className="text-xs text-slate-400">Drone đã rời bệnh viện</p>
          </div>
        </div>
        <div className={`timeline-item${currentIdx >= 3 ? ' active' : ''}${currentIdx > 3 ? ' completed' : ''}`} data-step="inflight">
          <div className="timeline-dot"><i className="fa-solid fa-location-arrow text-[8px]"></i></div>
          <div className="timeline-content">
            <p className="text-sm font-semibold text-slate-700">Đang bay</p>
            <p className="text-xs text-slate-400">Drone đang trên đường giao hàng</p>
          </div>
        </div>
        <div className={`timeline-item${currentIdx >= 4 ? ' active' : ''}${currentIdx > 4 ? ' completed' : ''}`} data-step="delivered">
          <div className="timeline-dot"><i className="fa-solid fa-flag-checkered text-[8px]"></i></div>
          <div className="timeline-content">
            <p className="text-sm font-semibold text-slate-700">Đã giao thành công</p>
            <p className="text-xs text-slate-400">Hàng đã đến tay người nhận</p>
          </div>
        </div>
      </div>
    </div>
  );
}

