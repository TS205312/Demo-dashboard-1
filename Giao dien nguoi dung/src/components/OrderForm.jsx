import { useRef } from 'react';
import useReveal from '../hooks/useReveal';

export default function OrderForm({ onSubmit, isSubmitting, onUrgencyChange, estTime }) {
  const formRef = useRef(null);
  const revealRef = useReveal();

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    onSubmit(formData);
  };

  return (
    <div className="zl-card zl-card--hover zl-reveal zl-reveal--d1" ref={revealRef}>
      <div className="zl-card__head">
        <h2 className="zl-card__title">
          <i className="fa-solid fa-clipboard-list zl-card__icon"></i>
          Thông tin đơn hàng
        </h2>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        {/* Mặt hàng y tế */}
        <div>
          <label htmlFor="medicalItem" className="form-label tracking-[0.01em]">
            <i className="fa-solid fa-syringe mr-1 text-violet"></i> Mặt hàng y tế <span className="text-danger">*</span>
          </label>
          <select
            id="medicalItem"
            name="medicalItem"
            className="form-glass form-select"
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
            <i className="fa-solid fa-location-dot mr-1 text-danger"></i> Điểm nhận <span className="text-danger">*</span>
          </label>
          <select
            id="destination"
            name="destination"
            className="form-glass form-select"
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
            <i className="fa-solid fa-triangle-exclamation mr-1 text-warning"></i> Mức độ khẩn cấp <span className="text-danger">*</span>
          </label>
          <div className="zl-options">
            <label className="zl-options__item">
              <input
                type="radio"
                name="urgency"
                id="urgency"
                value="Bình thường"
                required
                onChange={onUrgencyChange}
              />
              <span className="zl-options__label">
                ✅ Bình thường
                <small>Giao trong 60 phút</small>
              </span>
            </label>
            <label className="zl-options__item">
              <input
                type="radio"
                name="urgency"
                value="Cấp cứu khẩn"
                onChange={onUrgencyChange}
              />
              <span className="zl-options__label zl-options__label--urgent">
                🚨 Cấp cứu khẩn
                <small>Giao trong 15 phút</small>
              </span>
            </label>
          </div>
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
            className="form-glass resize-none"
            placeholder="Ví dụ: Cần giữ lạnh, kèm theo chỉ dẫn đặc biệt..."
          ></textarea>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          id="submitBtn"
          className="zl-btn zl-btn--dark zl-btn--block zl-btn--lg"
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
              <i className="fa-solid fa-arrow-up-right-from-square zl-btn__arrow"></i>
            </>
          )}
        </button>

        <p className="zl-est">
          <i className="fa-regular fa-clock mr-1"></i> Thời gian giao hàng ước tính: <strong>{estTime}</strong>
        </p>
      </form>
    </div>
  );
}
