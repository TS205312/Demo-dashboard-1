import { TIMELINE_STEPS, STATUS_TO_STEP, STATUS_BADGE_MAP, STATUS_LABEL_MAP } from '../utils/constants';

export default function OrderTimeline({ activeOrder }) {
  const status = activeOrder?.status || null;
  const stepKey = STATUS_TO_STEP[status] || 'received';
  const currentIdx = TIMELINE_STEPS.indexOf(stepKey);

  const badgeClass = status ? (STATUS_BADGE_MAP[status] || 'badge-pending') : 'badge-pending';
  const badgeText = status ? (STATUS_LABEL_MAP[status] || 'Chưa có đơn') : 'Chưa có đơn';

  return (
    <div className="glass-card mt-6 overflow-hidden p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3 border-b border-white/10 pb-4">
        <h2 className="flex items-center gap-3 text-base font-bold tracking-[0.01em] text-ink">
          <i className="fa-solid fa-list-check inline-flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/10 text-medical-500 ring-1 ring-cyan-300/15"></i>
          Tiến trình đơn hàng
        </h2>
        <span className={`badge ${badgeClass} shrink-0 text-[11px] shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]`}>{badgeText}</span>
      </div>

      <div className="timeline pr-1" id="orderTimeline">
        <div className={`timeline-item${currentIdx >= 0 ? ' active' : ''}${currentIdx > 0 ? ' completed' : ''}`} data-step="received">
          <div className="timeline-dot"><i className="fa-solid fa-check text-[8px]"></i></div>
          <div className="timeline-content">
            <p className="text-sm font-semibold text-ink">Đã tiếp nhận</p>
            <p className="text-xs text-ink-muted">Hệ thống xác nhận đơn hàng</p>
          </div>
        </div>
        <div className={`timeline-item${currentIdx >= 1 ? ' active' : ''}${currentIdx > 1 ? ' completed' : ''}`} data-step="packaging">
          <div className="timeline-dot"><i className="fa-solid fa-box text-[8px]"></i></div>
          <div className="timeline-content">
            <p className="text-sm font-semibold text-ink">Đóng gói</p>
            <p className="text-xs text-ink-muted">Kiểm tra & đóng gói hàng hóa y tế</p>
          </div>
        </div>
        <div className={`timeline-item${currentIdx >= 2 ? ' active' : ''}${currentIdx > 2 ? ' completed' : ''}`} data-step="departed">
          <div className="timeline-dot"><i className="fa-solid fa-rocket text-[8px]"></i></div>
          <div className="timeline-content">
            <p className="text-sm font-semibold text-ink">Drone cất cánh</p>
            <p className="text-xs text-ink-muted">Drone đã rời bệnh viện</p>
          </div>
        </div>
        <div className={`timeline-item${currentIdx >= 3 ? ' active' : ''}${currentIdx > 3 ? ' completed' : ''}`} data-step="inflight">
          <div className="timeline-dot"><i className="fa-solid fa-location-arrow text-[8px]"></i></div>
          <div className="timeline-content">
            <p className="text-sm font-semibold text-ink">Đang bay</p>
            <p className="text-xs text-ink-muted">Drone đang trên đường giao hàng</p>
          </div>
        </div>
        <div className={`timeline-item${currentIdx >= 4 ? ' active' : ''}${currentIdx > 4 ? ' completed' : ''}`} data-step="delivered">
          <div className="timeline-dot"><i className="fa-solid fa-flag-checkered text-[8px]"></i></div>
          <div className="timeline-content">
            <p className="text-sm font-semibold text-ink">Đã giao thành công</p>
            <p className="text-xs text-ink-muted">Hàng đã đến tay người nhận</p>
          </div>
        </div>
      </div>
    </div>
  );
}
