import { useRef } from 'react';

export default function OrderForm({ onSubmit, isSubmitting, onUrgencyChange, estTime }) {
  const formRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    onSubmit(formData);
  };

  return (
    <div className="glass-card relative overflow-hidden p-5 sm:p-6">
      <div className="mb-5 flex items-center gap-3 border-b border-white/10 pb-4">
        <i className="fa-solid fa-clipboard-list inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/10 text-lg text-medical-500 ring-1 ring-emerald-300/15"></i>
        <h2 className="text-base font-bold text-ink">Thông tin đơn hàng</h2>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        {/* Mặt hàng y tế */}
        <div>
          <label htmlFor="medicalItem" className="form-label tracking-[0.01em]">
            <i className="fa-solid fa-syringe mr-1 text-medical-500"></i> Mặt hàng y tế <span className="text-red-400">*</span>
          </label>
          <select
            id="medicalItem"
            name="medicalItem"
            className="form-glass form-select shadow-inner shadow-black/10 hover:border-white/25"
            required
          >
            <option value="" disabled selected>-- Chọn mặt hàng --</option>
            <option value="Túi máu O-">🩸 Túi máu O- (500ml)</option>
            <option value="Vắc-xin dại">💉 Vắc-xin dại (Verorab)</option>
            <option value="Huyết thanh kháng nọc rắn">🐍 Huyết thanh kháng nọc rắn</option>
            <option value="Insulin">💊 Insulin (Humalog 100UI/ml)</option>
            <option value="Thuốc chống đông máu">🩹 Thuốc chống đông máu (Heparin)</option>
            <option value="Dung dịch cao phân tử">🧪 Dung dịch cao phân tử (Haes-steril)</option>
            <option value="Mẫu bệnh phẩm sinh học">🔬 Mẫu bệnh phẩm sinh học</option>
            <option value="Thuốc giảm đau gây mê">💊 Thuốc giảm đau gây mê (Fentanyl)</option>
          </select>
        </div>

        {/* Điểm nhận */}
        <div>
          <label htmlFor="destination" className="form-label tracking-[0.01em]">
            <i className="fa-solid fa-location-dot mr-1 text-red-400"></i> Điểm nhận <span className="text-red-400">*</span>
          </label>
          <select
            id="destination"
            name="destination"
            className="form-glass form-select shadow-inner shadow-black/10 hover:border-white/25"
            required
          >
            <option value="" disabled selected>-- Chọn bệnh viện / điểm nhận --</option>
            <option value="Bệnh viện Chợ Rẫy">🏥 Bệnh viện Chợ Rẫy</option>
            <option value="Bệnh viện Từ Dũ">🏥 Bệnh viện Từ Dũ</option>
            <option value="Bệnh viện Nhi Đồng 1">🏥 Bệnh viện Nhi Đồng 1</option>
            <option value="Bệnh viện Nhi Đồng 2">🏥 Bệnh viện Nhi Đồng 2</option>
            <option value="Bệnh viện Đại học Y Dược">🏥 Bệnh viện Đại học Y Dược</option>
            <option value="Bệnh viện Nhân dân 115">🏥 Bệnh viện Nhân dân 115</option>
            <option value="Bệnh viện Thống Nhất">🏥 Bệnh viện Thống Nhất</option>
            <option value="Trạm y tế quận Bình Thạnh">🏪 Trạm y tế quận Bình Thạnh</option>
          </select>
        </div>

        {/* Mức độ khẩn cấp */}
        <div>
          <label htmlFor="urgency" className="form-label tracking-[0.01em]">
            <i className="fa-solid fa-triangle-exclamation mr-1 text-amber-400"></i> Mức độ khẩn cấp <span className="text-red-400">*</span>
          </label>
          <select
            id="urgency"
            name="urgency"
            className="form-glass form-select shadow-inner shadow-black/10 hover:border-white/25"
            required
            onChange={onUrgencyChange}
          >
            <option value="" disabled selected>-- Chọn mức độ --</option>
            <option value="Bình thường">✅ Bình thường (Giao trong 60 phút)</option>
            <option value="Cấp cứu khẩn">🚨 Cấp cứu khẩn (Giao trong 15 phút)</option>
          </select>
        </div>

        {/* Ghi chú (optional) */}
        <div>
          <label htmlFor="notes" className="form-label tracking-[0.01em]">
            <i className="fa-regular fa-note-sticky mr-1 text-ink-muted"></i> Ghi chú thêm
          </label>
          <textarea
            id="notes"
            name="notes"
            rows="2"
            className="form-glass resize-none shadow-inner shadow-black/10 hover:border-white/25"
            placeholder="Ví dụ: Cần giữ lạnh, kèm theo chỉ dẫn đặc biệt..."
          ></textarea>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          id="submitBtn"
          className="btn-primary rounded-2xl !py-3 shadow-[0_18px_42px_rgba(16,185,129,0.22)]"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="spinner"></span> Đang gửi yêu cầu...
            </>
          ) : (
            <>
              <i className="fa-solid fa-rocket"></i>
              YÊU CẦU PHÁT HÀNG DRONE
            </>
          )}
        </button>

        <p className="mt-1 rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 py-2 text-center text-[11px] text-ink-muted">
          <i className="fa-regular fa-clock mr-1"></i> Thời gian giao hàng ước tính: <strong className="text-ink-soft">{estTime}</strong>
        </p>
      </form>
    </div>
  );
}
