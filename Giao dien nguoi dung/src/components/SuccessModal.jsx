export default function SuccessModal({ show, orderCode, onClose }) {
  if (!show) return null;

  return (
    <div className="modal-overlay active" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
      <div className="modal-box text-center">
        <div className="modal-check-icon">
          <i className="fa-solid fa-check"></i>
        </div>
        <h3 id="modalTitle" className="mb-2 text-lg font-bold text-ink">Đặt hàng thành công!</h3>
        <p className="mb-1 text-sm text-ink-soft">
          Mã đơn hàng: <span className="font-semibold text-medical-600">{orderCode}</span>
        </p>
        <p className="mb-4 text-sm text-ink-soft">
          Drone sẽ xuất phát trong vài phút tới. Vui lòng theo dõi bản đồ.
        </p>
        <button
          onClick={onClose}
          className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/[0.08] px-6 py-2.5 text-sm font-medium text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md transition-all hover:border-emerald-300/25 hover:bg-emerald-500/15 hover:text-emerald-200"
        >
          <i className="fa-solid fa-check-circle"></i> Đã hiểu
        </button>
      </div>
    </div>
  );
}

