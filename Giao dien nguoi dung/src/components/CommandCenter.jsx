import { Clock, MapPinned, Plus, Radio, Satellite, Siren } from 'lucide-react';
import StatsBar from './StatsBar';
import TrackingMap from './TrackingMap';
import OrderTimeline from './OrderTimeline';
import RecentOrders from './RecentOrders';
import useReveal from '../hooks/useReveal';

/**
 * CommandCenter — màn tổng quan chính (1 trang):
 * header trạng thái + KPI + bản đồ lớn + mission panel + đơn gần đây
 */
export default function CommandCenter({
  user,
  liveTime,
  orders,
  activeOrder,
  onOpenCreate,
  onSelectOrder,
}) {
  const headerRef = useReveal();
  const mapRef = useReveal();
  const missionRef = useReveal();
  const recentRef = useReveal();

  const activeMissions = orders ? orders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length : 0;
  const urgent = orders ? orders.filter(o => o.urgency === 'Cấp cứu khẩn' && !['delivered', 'cancelled'].includes(o.status)).length : 0;
  const doctorName = user?.name || 'Bác sĩ';

  return (
    <div className="space-y-6">
      {/* Header strip */}
      <section className="cc-header zl-reveal" ref={headerRef}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="cc-header__title">
              Trung tâm điều phối <span>Drone SAH-TECH</span>
            </h1>
            <p className="cc-header__sub">
              Chào {doctorName} — bản đồ live, nhiệm vụ đang bay và đơn hàng gần đây
              được tổng hợp tại một nơi.
            </p>
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <span className="cc-header__clock">
              <Clock size={15} /> {liveTime}
            </span>
            <div className="flex flex-wrap gap-2">
              {urgent > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(251,113,133,0.4)] bg-[rgba(251,113,133,0.1)] px-3 py-1 text-xs font-bold text-[#fda4af]">
                  <Siren size={13} /> {urgent} đơn khẩn cấp
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(34,211,238,0.35)] bg-[rgba(34,211,238,0.08)] px-3 py-1 text-xs font-bold text-[#67e8f9]">
                <Radio size={13} /> {activeMissions} nhiệm vụ đang chạy
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* KPI */}
      <StatsBar orders={orders} />

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        {/* Map */}
        <div className="lg:col-span-3 zl-card zl-card--hover zl-reveal zl-reveal--d1 zl-cover" ref={mapRef}>
          <div className="zl-card__head flex-wrap">
            <h2 className="zl-card__title">
              <MapPinned className="zl-card__icon" size={20} />
              Bản đồ theo dõi Drone
            </h2>
            <span className="zl-legend shrink-0">
              <span><span className="dot dot--violet"></span>Bệnh viện</span>
              <span><span className="dot dot--emerald"></span>Điểm nhận</span>
              <span><Satellite size={13} className="inline mr-1 align-[-2px]" />Drone</span>
            </span>
          </div>
          <TrackingMap activeOrder={activeOrder} />
        </div>

        {/* Right rail */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active mission */}
          <div className="zl-card zl-card--hover zl-reveal zl-reveal--d2" ref={missionRef}>
            <div className="zl-card__head">
              <h2 className="zl-card__title">
                <span className="zl-card__icon"><Radio size={18} /></span>
                Nhiệm vụ hiện tại
              </h2>
              <button
                onClick={onOpenCreate}
                className="zl-btn zl-btn--ghost"
              >
                <Plus size={16} /> Tạo đơn
              </button>
            </div>
            <OrderTimeline activeOrder={activeOrder} />
          </div>

          {/* Recent orders */}
          <div className="zl-card zl-card--hover zl-reveal zl-reveal--d3" ref={recentRef}>
            <div className="zl-card__head">
              <h2 className="zl-card__title">
                <span className="zl-card__icon"><Radio size={18} /></span>
                Đơn hàng gần đây
              </h2>
            </div>
            <RecentOrders orders={orders} onSelectOrder={onSelectOrder} />
          </div>
        </div>
      </div>
    </div>
  );
}
