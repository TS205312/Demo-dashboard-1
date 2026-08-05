import { useState } from 'react';
import { apiLogin, apiRegister } from '../utils/api';
import '../styles/doctorAuth.css';

/**
 * Trang đăng nhập / đăng ký cho bác sĩ (User UI)
 * - Đăng ký yêu cầu mã OTP công ty (SAH2025)
 * - Lưu danh tính bác sĩ để gắn vào đơn hàng
 */
export default function DoctorAuth({ onLogin }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  const [formData, setFormData] = useState({
    // Login
    loginEmail: '',
    loginPassword: '',
    // Register
    regName: '',
    regEmail: '',
    regPassword: '',
    regConfirmPassword: '',
    regDoctorId: '',
    regDepartment: '',
    regHospital: '',
    regPhone: '',
    regOtp: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setError('');
    setSuccess('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const { loginEmail, loginPassword } = formData;
    if (!loginEmail || !loginPassword) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await apiLogin(loginEmail, loginPassword);
      if (result.success) {
        // Lưu user vào localStorage để giữ phiên đăng nhập
        localStorage.setItem('sah_current_user', JSON.stringify(result.data));
        onLogin(result.data);
      } else {
        setError(result.message || 'Email hoặc mật khẩu không đúng');
      }
} catch {
      setError('Lỗi kết nối server. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const {
      regName, regEmail, regPassword, regConfirmPassword,
      regDoctorId, regDepartment, regHospital, regPhone, regOtp,
    } = formData;

    if (!regName || !regEmail || !regPassword || !regOtp) {
      setError('Vui lòng nhập đầy đủ họ tên, email, mật khẩu và mã OTP công ty');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    if (regPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await apiRegister({
        name: regName,
        email: regEmail,
        password: regPassword,
        company_otp: regOtp,
        doctor_id: regDoctorId,
        department: regDepartment,
        hospital: regHospital,
        phone: regPhone,
      });

      if (result.success) {
        setSuccess('Đăng ký thành công! Vui lòng đăng nhập.');
        // Auto switch to login after 1.5s
        setTimeout(() => {
          switchTab('login');
          setSuccess('');
          setFormData({
            ...formData,
            loginEmail: regEmail,
            regName: '', regEmail: '', regPassword: '', regConfirmPassword: '',
            regDoctorId: '', regDepartment: '', regHospital: '', regPhone: '', regOtp: '',
          });
        }, 1500);
      } else {
        setError(result.message || 'Đăng ký thất bại');
      }
    } catch {
      setError('Lỗi kết nối server. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="doctor-auth-container">
      {/* Background decoration */}
      <div className="doctor-auth-glow doctor-auth-glow-1" />
      <div className="doctor-auth-glow doctor-auth-glow-2" />

      <div className="doctor-auth-card">
        <div className="doctor-auth-scroll">
        {/* Branding */}
<div className="doctor-auth-brand">
          <div className="doctor-auth-logo-wrap">
            <img src="/sah-logo.png" alt="SAH-TECH" style={{ width: 84, height: 84, objectFit: 'contain' }} />
          </div>
          <h1 className="doctor-auth-title">SAH-TECH Medical</h1>
          <p className="doctor-auth-subtitle">Cổng đặt hàng vận chuyển y tế bằng Drone</p>
        </div>

        {/* Tab switcher */}
        <div className="doctor-auth-tabs">
          <button
            className={`doctor-auth-tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => switchTab('login')}
          >
            <i className="fa-regular fa-right-to-bracket"></i> Đăng nhập
          </button>
          <button
            className={`doctor-auth-tab ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => switchTab('register')}
          >
            <i className="fa-regular fa-user-plus"></i> Đăng ký
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="doctor-auth-error">
            <i className="fa-regular fa-circle-exclamation"></i> {error}
          </div>
        )}
        {success && (
          <div className="doctor-auth-success">
            <i className="fa-regular fa-circle-check"></i> {success}
          </div>
        )}

        {/* ===== LOGIN FORM ===== */}
        {activeTab === 'login' && (
          <form className="doctor-auth-form" onSubmit={handleLoginSubmit}>
            <div className="doctor-input-group">
              <label className="doctor-label">Email công việc</label>
              <div className="doctor-input-wrapper">
                <i className="doctor-input-icon fa-regular fa-envelope"></i>
                <input
                  type="text"
                  name="loginEmail"
                  className="doctor-input"
                  placeholder="vd: bs.an@sah.tech"
                  value={formData.loginEmail}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="doctor-input-group">
              <label className="doctor-label">Mật khẩu</label>
              <div className="doctor-input-wrapper">
                <i className="doctor-input-icon fa-regular fa-lock"></i>
                <input
                  type="password"
                  name="loginPassword"
                  className="doctor-input"
                  placeholder="Nhập mật khẩu"
                  value={formData.loginPassword}
                  onChange={handleChange}
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button type="submit" className="doctor-submit-btn" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="doctor-spinner"></span> Đang xác thực...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-user-md"></i> Đăng nhập
                </>
              )}
            </button>

            <p className="doctor-footer-text">
              Chưa có tài khoản?{' '}
              <span className="doctor-link" onClick={() => switchTab('register')}>
                Đăng ký tài khoản bác sĩ
              </span>
            </p>

            <div className="doctor-demo-hint">
              <i className="fa-solid fa-flask"></i>
              Tài khoản demo: <strong>bs.an@sah.tech</strong> / <strong>doctor123</strong>
            </div>
          </form>
        )}

        {/* ===== REGISTER FORM ===== */}
        {activeTab === 'register' && (
          <form className="doctor-auth-form" onSubmit={handleRegisterSubmit}>
            <div className="doctor-input-group">
              <label className="doctor-label">Họ và tên bác sĩ</label>
              <div className="doctor-input-wrapper">
                <i className="doctor-input-icon fa-regular fa-user"></i>
                <input
                  type="text"
                  name="regName"
                  className="doctor-input"
                  placeholder="VD: BS. Nguyễn Văn An"
                  value={formData.regName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="doctor-input-group">
              <label className="doctor-label">Email công việc</label>
              <div className="doctor-input-wrapper">
                <i className="doctor-input-icon fa-regular fa-envelope"></i>
                <input
                  type="email"
                  name="regEmail"
                  className="doctor-input"
                  placeholder="VD: bs.an@benhvien.vn"
                  value={formData.regEmail}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="doctor-input-row">
              <div className="doctor-input-group">
                <label className="doctor-label">Mã bác sĩ</label>
                <div className="doctor-input-wrapper">
                  <i className="doctor-input-icon fa-regular fa-id-card"></i>
                  <input
                    type="text"
                    name="regDoctorId"
                    className="doctor-input"
                    placeholder="VD: BS001"
                    value={formData.regDoctorId}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="doctor-input-group">
                <label className="doctor-label">Khoa / Phòng</label>
                <div className="doctor-input-wrapper">
                  <i className="doctor-input-icon fa-regular fa-hospital"></i>
                  <input
                    type="text"
                    name="regDepartment"
                    className="doctor-input"
                    placeholder="VD: Khoa Cấp cứu"
                    value={formData.regDepartment}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="doctor-input-group">
              <label className="doctor-label">Bệnh viện công tác</label>
              <div className="doctor-input-wrapper">
                <i className="doctor-input-icon fa-regular fa-building"></i>
                <input
                  type="text"
                  name="regHospital"
                  className="doctor-input"
                  placeholder="VD: Bệnh viện Chợ Rẫy"
                  value={formData.regHospital}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="doctor-input-group">
              <label className="doctor-label">Số điện thoại liên hệ</label>
              <div className="doctor-input-wrapper">
                <i className="doctor-input-icon fa-regular fa-phone"></i>
                <input
                  type="text"
                  name="regPhone"
                  className="doctor-input"
                  placeholder="VD: 0901234567"
                  value={formData.regPhone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="doctor-input-group">
              <label className="doctor-label">Mật khẩu</label>
              <div className="doctor-input-wrapper">
                <i className="doctor-input-icon fa-regular fa-lock"></i>
                <input
                  type="password"
                  name="regPassword"
                  className="doctor-input"
                  placeholder="Ít nhất 6 ký tự"
                  value={formData.regPassword}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="doctor-input-group">
              <label className="doctor-label">Xác nhận mật khẩu</label>
              <div className="doctor-input-wrapper">
                <i className="doctor-input-icon fa-regular fa-lock"></i>
                <input
                  type="password"
                  name="regConfirmPassword"
                  className="doctor-input"
                  placeholder="Nhập lại mật khẩu"
                  value={formData.regConfirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* OTP công ty */}
            <div className="doctor-input-group doctor-otp-group">
              <label className="doctor-label">
                <i className="fa-solid fa-key"></i> Mã OTP công ty <span className="doctor-required">*</span>
              </label>
              <div className="doctor-input-wrapper">
                <i className="doctor-input-icon fa-regular fa-shield-halved"></i>
                <input
                  type="text"
                  name="regOtp"
                  className="doctor-input"
                  placeholder="Nhập mã OTP do công ty cấp"
                  value={formData.regOtp}
                  onChange={handleChange}
                />
              </div>
              <p className="doctor-otp-hint">
                Chỉ nhân viên / bác sĩ trong công ty được cấp mã mới đăng ký được.
              </p>
            </div>

            <button type="submit" className="doctor-submit-btn" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="doctor-spinner"></span> Đang đăng ký...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-user-plus"></i> Đăng ký tài khoản
                </>
              )}
            </button>

            <p className="doctor-footer-text">
              Đã có tài khoản?{' '}
              <span className="doctor-link" onClick={() => switchTab('login')}>
                Đăng nhập
              </span>
            </p>
          </form>
        )}

        <div className="doctor-auth-version">
          SAH Medical Portal v3.0
        </div>
        </div>
      </div>
    </div>
  );
}

