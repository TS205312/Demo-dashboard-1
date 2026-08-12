import { Check, Flag, ListChecks, Navigation, Package, Rocket } from 'lucide-react';
import { TIMELINE_STEPS, STATUS_TO_STEP, STATUS_BADGE_MAP, STATUS_LABEL_MAP } from '../utils/constants';

/**
 * OrderTimeline — tiến trình đơn hàng (content-only, đã được bọc card bên ngoài)
 */
export default function OrderTimeline({ activeOrder }) {
  const status = activeOrder?.status || null;
  const stepKey = STATUS_TO_STEP[status] || 'received';
  const currentIdx = TIMELINE_STEPS.indexOf(stepKey);

  const badgeClass = status ? (STATUS_BADGE_MAP[status] || 'badge-pending') : 'badge-pending';
  const badgeText = status ? (STATUS_LABEL_MAP[status] || 'Chưa có đơn') : 'Chưa có đơn';

  const steps = [
    { icon: Check, title: 'Đã tiếp nhận', desc: 'Hệ thống xác nhận đơn hàng' },
    { icon: Package, title: 'Đóng gói', desc: 'Kiểm tra & đóng gói hàng hóa y tế' },
    { icon: Rocket, title: 'Drone cất cánh', desc: 'Drone đã rời bệnh viện' },
    { icon: Navigation, title: 'Đang bay', desc: 'Drone đang trên đường giao hàng' },
    { icon: Flag, title: 'Đã giao thành công', desc: 'Hàng đã đến tay người nhận' },
  ];

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs font-bold text-ink-soft">
          <ListChecks size={14} className="text-[#22d3ee]" /> Tiến trình
        </span>
        <span className={`badge ${badgeClass} shrink-0 text-[11px]`}>{badgeText}</span>
      </div>

      <div className="timeline pr-1" id="orderTimeline">
        {steps.map((step, i) => (
          <div
            key={step.title}
            className={`timeline-item${currentIdx >= i ? ' active' : ''}${currentIdx > i ? ' completed' : ''}`}
          >
            <div className="timeline-dot"><step.icon size={12} /></div>
            <div className="timeline-content">
              <p className="text-sm font-bold text-ink">{step.title}</p>
              <p className="text-xs text-ink-muted">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
