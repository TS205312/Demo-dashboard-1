import { TIMELINE_STEPS, STATUS_TO_STEP, STATUS_BADGE_MAP, STATUS_LABEL_MAP } from '../utils/constants';
import useReveal from '../hooks/useReveal';

export default function OrderTimeline({ activeOrder }) {
  const revealRef = useReveal();
  const status = activeOrder?.status || null;
  const stepKey = STATUS_TO_STEP[status] || 'received';
  const currentIdx = TIMELINE_STEPS.indexOf(stepKey);

  const badgeClass = status ? (STATUS_BADGE_MAP[status] || 'badge-pending') : 'badge-pending';
  const badgeText = status ? (STATUS_LABEL_MAP[status] || 'Chưa có đơn') : 'Chưa có đơn';

  return (
    <div className="zl-card zl-card--hover zl-reveal zl-reveal--d2" ref={revealRef}>
      <div className="zl-card__head">
        <h2 className="zl-card__title">
          <i className="fa-solid fa-list-check zl-card__icon"></i>
          Tiến trình đơn hàng
        </h2>
        <span className={`badge ${badgeClass} shrink-0 text-[11px]`}>{badgeText}</span>
      </div>

      <div className="timeline pr-1" id="orderTimeline">
        <div className={`timeline-item${currentIdx >= 0 ? ' active' : ''}${currentIdx > 0 ? ' completed' : ''}`} data-step="received">
          <div className="timeline-dot"><i className="fa-solid fa-check text-[8px]"></i></div>
          <div className="timeline-content">
            <p className="text-sm font-bold text-ink">Đã tiếp nhận</p>
            <p className="text-xs text-ink-muted">Hệ thống xác nhận đơn hàng</p>
          </div>
        </div>
        <div className={`timeline-item${currentIdx >= 1 ? ' active' : ''}${currentIdx > 1 ? ' completed' : ''}`} data-step="packaging">
          <div className="timeline-dot"><i className="fa-solid fa-box text-[8px]"></i></div>
          <div className="timeline-content">
            <p className="text-sm font-bold text-ink">Đóng gói</p>
            <p className="text-xs text-ink-muted">Kiểm tra & đóng gói hàng hóa y tế</p>
          </div>
        </div>
        <div className={`timeline-item${currentIdx >= 2 ? ' active' : ''}${currentIdx > 2 ? ' completed' : ''}`} data-step="departed">
          <div className="timeline-dot"><i className="fa-solid fa-rocket text-[8px]"></i></div>
          <div className="timeline-content">
            <p className="text-sm font-bold text-ink">Drone cất cánh</p>
            <p className="text-xs text-ink-muted">Drone đã rời bệnh viện</p>
          </div>
        </div>
        <div className={`timeline-item${currentIdx >= 3 ? ' active' : ''}${currentIdx > 3 ? ' completed' : ''}`} data-step="inflight">
          <div className="timeline-dot"><i className="fa-solid fa-location-arrow text-[8px]"></i></div>
          <div className="timeline-content">
            <p className="text-sm font-bold text-ink">Đang bay</p>
            <p className="text-xs text-ink-muted">Drone đang trên đường giao hàng</p>
          </div>
        </div>
        <div className={`timeline-item${currentIdx >= 4 ? ' active' : ''}${currentIdx > 4 ? ' completed' : ''}`} data-step="delivered">
          <div className="timeline-dot"><i className="fa-solid fa-flag-checkered text-[8px]"></i></div>
          <div className="timeline-content">
            <p className="text-sm font-bold text-ink">Đã giao thành công</p>
            <p className="text-xs text-ink-muted">Hàng đã đến tay người nhận</p>
          </div>
        </div>
      </div>
    </div>
  );
}
