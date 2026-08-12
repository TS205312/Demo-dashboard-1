import { Check, CircleCheckBig } from 'lucide-react';

export default function SuccessModal({ show, orderCode, onClose }) {
  if (!show) return null;

  return (
    <div className="modal-overlay active" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
      <div className="modal-box text-center">
        <div className="modal-check-icon">
          <CircleCheckBig size={34} />
        </div>
        <h3 id="modalTitle" className="mb-2 text-xl font-bold text-ink">Đặt hàng thành công!</h3>
        <p className="mb-1 text-sm text-ink-soft">
          Mã đơn hàng: <span className="font-bold text-[#0891b2]">{orderCode}</span>
        </p>
        <p className="mb-5 text-sm text-ink-muted">
          Drone sẽ xuất phát trong vài phút tới. Vui lòng theo dõi bản đồ.
        </p>
        <button
          onClick={onClose}
          className="inline-flex items-center gap-2 rounded-full bg-[#0891b2] px-7 py-2.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-[#0e7490] cursor-pointer"
        >
          <Check size={16} /> Đã hiểu
        </button>
      </div>
    </div>
  );
}
