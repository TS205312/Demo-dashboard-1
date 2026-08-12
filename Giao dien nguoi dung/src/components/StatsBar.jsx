import { CheckCheck, Drone, Map, PackageSearch } from 'lucide-react';
import useCountUp from '../hooks/useCountUp';

/**
 * StatsBar - Hàng thống kê sống động (đếm số khi cuộn vào viewport)
 */
export default function StatsBar({ orders }) {
  const inFlight = orders ? orders.filter(o => o.status === 'inflight' || o.status === 'departed').length : 0;
  const processing = orders ? orders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length : 0;
  const delivered = orders ? orders.filter(o => o.status === 'delivered').length : 0;

  const [processingN, processingRef] = useCountUp(processing);
  const [deliveredN, deliveredRef] = useCountUp(delivered);
  const [flightN, flightRef] = useCountUp(inFlight);
  const [rangeN, rangeRef] = useCountUp(25);

  const items = [
    {
      icon: PackageSearch,
      value: processingN,
      suffix: '',
      label: 'Đơn đang xử lý',
      caption: 'Trong hệ thống điều phối',
      ref: processingRef,
      tone: 'tone-cyan',
    },
    {
      icon: CheckCheck,
      value: deliveredN,
      suffix: '',
      label: 'Đã giao thành công',
      caption: 'Tổng lượt vận chuyển',
      ref: deliveredRef,
      tone: 'tone-green',
    },
    {
      icon: Drone,
      value: flightN,
      suffix: '',
      label: 'Drone đang bay',
      caption: 'Trên tuyến đường',
      ref: flightRef,
      tone: 'tone-blue',
    },
    {
      icon: Map,
      value: rangeN,
      suffix: ' km',
      label: 'Phạm vi phục vụ',
      caption: 'Quanh khu vực TP.HCM',
      ref: rangeRef,
      tone: 'tone-amber',
    },
  ];

  return (
    <section className="stats-bar" aria-label="Thống kê hệ thống">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
        {items.map(item => {
          const Icon = item.icon;
          return (
            <div key={item.label} className={`stat-card ${item.tone}`} ref={item.ref}>
              <div className="stat-card__top">
                <span className="stat-card__icon">
                  <Icon size={20} />
                </span>
                <span className="stat-card__pulse" aria-hidden="true"></span>
              </div>
              <p className="stat-card__value">
                <span className="stat-card__num">{item.value}</span>
                <span className="stat-card__suffix">{item.suffix}</span>
              </p>
              <p className="stat-card__label">{item.label}</p>
              <p className="stat-card__caption">{item.caption}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
