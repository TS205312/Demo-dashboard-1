import { useRef } from 'react';

export default function OrderForm({ onSubmit, isSubmitting, onUrgencyChange, estTime }) {
  const formRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    onSubmit(formData);
  };

  return (
    <div className="glass-card p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-5">
        <i className="fa-solid fa-clipboard-list text-medical-500 text-lg"></i>
        <h2 className="text-base font-bold text-slate-800">Thông tin đơn hàng</h2>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        {/* Mặt hàng y tế */}
        <div>
          <label htmlFor="medicalItem" className="block text-xs font-semibold text-slate-600 mb-1.5">
            <i className="fa-solid fa-syringe mr-1 text-medical-400"></i> Mặt hàng y tế <span className="text-red-500">*</span>
          </label>
          <select
            id="medicalItem"
            name="medicalItem"
            className="form-select w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-medical-300 focus:border-medical-400 transition-shadow"
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
          <label htmlFor="destination" className="block text-xs font-semibold text-slate-600 mb-1.5">
            <i className="fa-solid fa-location-dot mr-1 text-red-400"></i> Điểm nhận <span className="text-red-500">*</span>
          </label>
          <select
            id="destination"
            name="destination"
            className="form-select w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-medical-300 focus:border-medical-400 transition-shadow"
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
          <label htmlFor="urgency" className="block text-xs font-semibold text-slate-600 mb-1.5">
            <i className="fa-solid fa-triangle-exclamation mr-1 text-amber-500"></i> Mức độ khẩn cấp <span className="text-red-500">*</span>
          </label>
          <select
            id="urgency"
            name="urgency"
            className="form-select w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-medical-300 focus:border-medical-400 transition-shadow"
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
          <label htmlFor="notes" className="block text-xs font-semibold text-slate-600 mb-1.5">
            <i className="fa-regular fa-note-sticky mr-1 text-slate-400"></i> Ghi chú thêm
          </label>
          <textarea
            id="notes"
            name="notes"
            rows="2"
            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-medical-300 focus:border-medical-400 transition-shadow resize-none"
            placeholder="Ví dụ: Cần giữ lạnh, kèm theo chỉ dẫn đặc biệt..."
          ></textarea>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          id="submitBtn"
          className="btn-primary"
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

        <p className="text-[11px] text-slate-400 text-center mt-1">
          <i className="fa-regular fa-clock mr-1"></i> Thời gian giao hàng ước tính: <strong className="text-slate-600">{estTime}</strong>
        </p>
      </form>
    </div>
  );
}

