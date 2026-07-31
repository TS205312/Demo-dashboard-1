export default function SuccessModal({ show, orderCode, onClose }) {
  if (!show) return null;

  return (
    <div className="modal-overlay active" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
      <div className="modal-box text-center">
        <div className="modal-check-icon">
          <i className="fa-solid fa-check"></i>
        </div>
        <h3 id="modalTitle" className="text-lg font-bold text-slate-800 mb-2">Đặt hàng thành công!</h3>
        <p className="text-sm text-slate-500 mb-1">
          Mã đơn hàng: <span className="font-semibold text-medical-600">{orderCode}</span>
        </p>
        <p className="text-sm text-slate-500 mb-4">
          Drone sẽ xuất phát trong vài phút tới. Vui lòng theo dõi bản đồ.
        </p>
        <button
          onClick={onClose}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-all text-sm"
        >
          <i className="fa-solid fa-check-circle"></i> Đã hiểu
        </button>
      </div>
    </div>
  );
}

