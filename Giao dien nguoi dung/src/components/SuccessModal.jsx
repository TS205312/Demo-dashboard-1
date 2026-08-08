export default function SuccessModal({ show, orderCode, onClose }) {
  if (!show) return null;

  return (
    <div className="modal-overlay active" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
      <div className="modal-box text-center">
        <div className="modal-check-icon">
          <i className="fa-solid fa-check"></i>
        </div>
        <h3 id="modalTitle" className="mb-2 text-xl font-bold text-[#f7f4e8]">Đặt hàng thành công!</h3>
        <p className="mb-1 text-sm text-[#f7f4e8]/80">
          Mã đơn hàng: <span className="font-bold text-[#a78bfa]">{orderCode}</span>
        </p>
        <p className="mb-5 text-sm text-[#f7f4e8]/70">
          Drone sẽ xuất phát trong vài phút tới. Vui lòng theo dõi bản đồ.
        </p>
        <button
          onClick={onClose}
          className="inline-flex items-center gap-2 rounded-full bg-[#f7f4e8] px-7 py-2.5 text-sm font-bold text-black transition-transform hover:-translate-y-0.5"
        >
          <i className="fa-solid fa-check-circle"></i> Đã hiểu
        </button>
      </div>
    </div>
  );
}
