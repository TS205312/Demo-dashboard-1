import { useState } from 'react';
import { apiLogin, apiRegister } from '../data/api';
import '../styles/login.css';

function LoginRegister({ onLogin }) {
  const [activeTab, setActiveTab] = useState('login');
  const [formData, setFormData] = useState({
    loginEmail: '',
    loginPassword: '',
    regName: '',
    regEmail: '',
    regPassword: '',
    regConfirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const { loginEmail, loginPassword } = formData;
    if (!loginEmail || !loginPassword) {
      setError('Vui lòng nhập đầy đủ thông tin đăng nhập');
      return;
    }

    const result = await apiLogin(loginEmail, loginPassword);

    if (result.success) {
      onLogin(result.data);
    } else {
      setError(result.message || 'Email hoặc mật khẩu không đúng!');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const { regName, regEmail, regPassword, regConfirmPassword } = formData;
    if (!regName || !regEmail || !regPassword) {
      setError('Vui lòng nhập đầy đủ thông tin');
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

    const result = await apiRegister(regName, regEmail, regPassword);

    if (result.success) {
      setSuccess('Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.');
      setFormData({ ...formData, regName: '', regEmail: '', regPassword: '', regConfirmPassword: '' });
      setTimeout(() => {
        setActiveTab('login');
        setSuccess('');
      }, 1500);
    } else {
      setError(result.message || 'Đăng ký thất bại');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-bg-glow auth-bg-glow-1" />
      <div className="auth-bg-glow auth-bg-glow-2" />

      <div className="auth-card">
        {/* Logo & Branding */}
        <div className="auth-brand">
          <div className="auth-logo">
            <svg viewBox="0 0 48 48" width="48" height="48">
              <circle cx="24" cy="24" r="22" fill="none" stroke="#58a6ff" strokeWidth="2" />
              <path d="M24 8 L28 20 L40 20 L30 28 L34 40 L24 32 L14 40 L18 28 L8 20 L20 20 Z" fill="#58a6ff" opacity="0.8" />
              <circle cx="24" cy="24" r="4" fill="#0d1117" />
            </svg>
          </div>
          <h1 className="auth-title">SAH-TECH</h1>
          <p className="auth-subtitle">Drone Control Station</p>
        </div>

        {/* Tab Switcher */}
        <div className="auth-tabs">
          <button
            className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => { setActiveTab('login'); setError(''); setSuccess(''); }}
          >
            Đăng nhập
          </button>
          <button
            className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => { setActiveTab('register'); setError(''); setSuccess(''); }}
          >
            Đăng ký
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="auth-error">
            <i className="fa-regular fa-triangle-exclamation"></i> {error}
          </div>
        )}

        {/* Success message */}
        {success && (
          <div className="auth-success">
            <i className="fa-regular fa-circle-check"></i> {success}
          </div>
        )}

        {/* Login Form */}
        {activeTab === 'login' && (
          <form className="auth-form" onSubmit={handleLogin}>
            <div className="auth-input-group">
              <label className="auth-label">Email</label>
              <div className="auth-input-wrapper">
                <i className="auth-input-icon fa-regular fa-user"></i>
                <input
                  type="text"
                  name="loginEmail"
                  className="auth-input"
                  placeholder="Nhập email"
                  value={formData.loginEmail}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="auth-input-group">
              <label className="auth-label">Mật khẩu</label>
              <div className="auth-input-wrapper">
                <i className="auth-input-icon fa-regular fa-lock"></i>
                <input
                  type="password"
                  name="loginPassword"
                  className="auth-input"
                  placeholder="Nhập mật khẩu"
                  value={formData.loginPassword}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button type="submit" className="auth-submit-btn">
              Đăng nhập
            </button>

            <p className="auth-footer-text">
              Chưa có tài khoản?{' '}
              <span className="auth-link" onClick={() => { setActiveTab('register'); setError(''); }}>
                Đăng ký ngay
              </span>
            </p>

            <div className="auth-admin-hint">
              <i className="fa-regular fa-key"></i> Admin: admin@sah.tech / admin123
            </div>
          </form>
        )}

        {/* Register Form */}
        {activeTab === 'register' && (
          <form className="auth-form" onSubmit={handleRegister}>
            <div className="auth-input-group">
              <label className="auth-label">Họ và tên</label>
              <div className="auth-input-wrapper">
                <i className="auth-input-icon fa-regular fa-user"></i>
                <input
                  type="text"
                  name="regName"
                  className="auth-input"
                  placeholder="Nhập họ và tên"
                  value={formData.regName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="auth-input-group">
              <label className="auth-label">Email</label>
              <div className="auth-input-wrapper">
                <i className="auth-input-icon fa-regular fa-envelope"></i>
                <input
                  type="email"
                  name="regEmail"
                  className="auth-input"
                  placeholder="Nhập địa chỉ email"
                  value={formData.regEmail}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="auth-input-group">
              <label className="auth-label">Mật khẩu</label>
              <div className="auth-input-wrapper">
                <i className="auth-input-icon fa-regular fa-lock"></i>
                <input
                  type="password"
                  name="regPassword"
                  className="auth-input"
                  placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
                  value={formData.regPassword}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="auth-input-group">
              <label className="auth-label">Xác nhận mật khẩu</label>
              <div className="auth-input-wrapper">
                <i className="auth-input-icon fa-regular fa-lock"></i>
                <input
                  type="password"
                  name="regConfirmPassword"
                  className="auth-input"
                  placeholder="Nhập lại mật khẩu"
                  value={formData.regConfirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button type="submit" className="auth-submit-btn">
              Đăng ký
            </button>

            <p className="auth-footer-text">
              Đã có tài khoản?{' '}
              <span className="auth-link" onClick={() => { setActiveTab('login'); setError(''); }}>
                Đăng nhập
              </span>
            </p>
          </form>
        )}

        <div className="auth-version">
          SAH Ground Station v2.0.0
        </div>
      </div>
    </div>
  );
}

export default LoginRegister;

