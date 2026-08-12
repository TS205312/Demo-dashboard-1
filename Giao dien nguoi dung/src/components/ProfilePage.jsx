import { useState } from 'react';
import {
  BadgeCheck,
  Building2,
  CircleAlert,
  CircleCheckBig,
  Hospital,
  IdCard,
  KeyRound,
  Lock,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  Stethoscope,
  User,
  UserRound,
} from 'lucide-react';
import { apiUpdateProfile } from '../utils/api';
import useReveal from '../hooks/useReveal';

/**
 * Trang "Sửa tài khoản" — cập nhật hồ sơ bác sĩ + đổi mật khẩu
 */
export default function ProfilePage({ user, onUpdated, onNotify }) {
  const summaryRef = useReveal();
  const tipRef = useReveal();
  const infoRef = useReveal();
  const pwdRef = useReveal();

  const [form, setForm] = useState({
    name: user?.name || '',
    doctor_id: user?.doctor_id || '',
    department: user?.department || '',
    hospital: user?.hospital || '',
    phone: user?.phone || '',
  });

  const [pwd, setPwd] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPwd, setIsChangingPwd] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handlePwdChange = (e) => {
    setPwd({ ...pwd, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.name.trim()) {
      setError('Họ tên không được để trống');
      return;
    }

    setIsSaving(true);
    try {
      const result = await apiUpdateProfile(user.id, {
        name: form.name.trim(),
        doctor_id: form.doctor_id.trim(),
        department: form.department.trim(),
        hospital: form.hospital.trim(),
        phone: form.phone.trim(),
      });

      if (result.success) {
        localStorage.setItem('sah_current_user', JSON.stringify(result.data));
        onUpdated?.(result.data);
        setSuccess('Đã lưu thông tin tài khoản thành công!');
        onNotify?.({ message: '✅ Đã cập nhật thông tin tài khoản', type: 'success' });
      } else {
        setError(result.message || 'Lưu thông tin thất bại');
      }
    } catch {
      setError('Lỗi kết nối server. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const { currentPassword, newPassword, confirmPassword } = pwd;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Vui lòng nhập đầy đủ các trường mật khẩu');
      return;
    }
    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Xác nhận mật khẩu mới không khớp');
      return;
    }

    setIsChangingPwd(true);
    try {
      const result = await apiUpdateProfile(user.id, {
        currentPassword,
        newPassword,
      });

      if (result.success) {
        setPwd({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setSuccess('Đã đổi mật khẩu thành công!');
        onNotify?.({ message: '🔑 Đã đổi mật khẩu thành công', type: 'success' });
      } else {
        setError(result.message || 'Đổi mật khẩu thất bại');
      }
    } catch {
      setError('Lỗi kết nối server. Vui lòng thử lại.');
    } finally {
      setIsChangingPwd(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
      {/* Profile summary card */}
      <div className="lg:col-span-2 space-y-6">
        <div className="profile-summary zl-card zl-card--hover zl-reveal" ref={summaryRef}>
          <div className="profile-avatar-wrap">
            <div className="profile-avatar">
              <Stethoscope size={38} />
            </div>
            <span className="profile-status-dot" title="Đang hoạt động"></span>
          </div>
          <h2 className="profile-name">{user?.name || 'Bác sĩ'}</h2>
          <p className="profile-role">
            <BadgeCheck size={14} /> Tài khoản đã xác thực
          </p>

          <div className="profile-meta">
            <div className="profile-meta__row">
              <Mail size={15} />
              <span>{user?.email || '--'}</span>
            </div>
            <div className="profile-meta__row">
              <IdCard size={15} />
              <span>{user?.doctor_id || 'Chưa có mã bác sĩ'}</span>
            </div>
            <div className="profile-meta__row">
              <Building2 size={15} />
              <span>{user?.department || '--'}</span>
            </div>
            <div className="profile-meta__row">
              <Hospital size={15} />
              <span>{user?.hospital || '--'}</span>
            </div>
            <div className="profile-meta__row">
              <Phone size={15} />
              <span>{user?.phone || '--'}</span>
            </div>
          </div>
        </div>

        <div className="profile-tip zl-reveal zl-reveal--d2" ref={tipRef}>
          <ShieldCheck size={18} />
          <p>
            Thông tin bác sĩ sẽ được gắn tự động vào mỗi đơn hàng vận chuyển để
            trung tâm điều phối xác minh nhanh hơn.
          </p>
        </div>
      </div>

      {/* Edit forms */}
      <div className="lg:col-span-3 space-y-6">
        {/* Thông tin tài khoản */}
        <div className="zl-card zl-card--hover zl-reveal zl-reveal--d1" ref={infoRef}>
          <div className="zl-card__head">
            <h2 className="zl-card__title">
              <UserRound className="zl-card__icon" size={20} />
              Thông tin tài khoản
            </h2>
          </div>

          {error && (
            <div className="doctor-auth-error">
              <CircleAlert /> {error}
            </div>
          )}
          {success && (
            <div className="doctor-auth-success">
              <CircleCheckBig /> {success}
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="doctor-input-group">
              <label className="doctor-label">Họ và tên bác sĩ</label>
              <div className="doctor-input-wrapper">
                <User className="doctor-input-icon" />
                <input
                  type="text"
                  name="name"
                  className="doctor-input"
                  placeholder="VD: BS. Nguyễn Văn An"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="doctor-input-group">
              <label className="doctor-label">Email công việc</label>
              <div className="doctor-input-wrapper">
                <Mail className="doctor-input-icon" />
                <input
                  type="email"
                  className="doctor-input"
                  value={user?.email || ''}
                  readOnly
                  disabled
                />
              </div>
              <p className="profile-hint">Email dùng để đăng nhập, không thể thay đổi.</p>
            </div>

            <div className="doctor-input-row">
              <div className="doctor-input-group">
                <label className="doctor-label">Mã bác sĩ</label>
                <div className="doctor-input-wrapper">
                  <IdCard className="doctor-input-icon" />
                  <input
                    type="text"
                    name="doctor_id"
                    className="doctor-input"
                    placeholder="VD: BS001"
                    value={form.doctor_id}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="doctor-input-group">
                <label className="doctor-label">Khoa / Phòng</label>
                <div className="doctor-input-wrapper">
                  <Building2 className="doctor-input-icon" />
                  <input
                    type="text"
                    name="department"
                    className="doctor-input"
                    placeholder="VD: Khoa Cấp cứu"
                    value={form.department}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="doctor-input-group">
              <label className="doctor-label">Bệnh viện công tác</label>
              <div className="doctor-input-wrapper">
                <Hospital className="doctor-input-icon" />
                <input
                  type="text"
                  name="hospital"
                  className="doctor-input"
                  placeholder="VD: Bệnh viện Chợ Rẫy"
                  value={form.hospital}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="doctor-input-group">
              <label className="doctor-label">Số điện thoại liên hệ</label>
              <div className="doctor-input-wrapper">
                <Phone className="doctor-input-icon" />
                <input
                  type="text"
                  name="phone"
                  className="doctor-input"
                  placeholder="VD: 0901234567"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button type="submit" className="zl-btn zl-btn--dark zl-btn--block zl-btn--lg" disabled={isSaving}>
              {isSaving ? (
                <>
                  <span className="spinner"></span> Đang lưu...
                </>
              ) : (
                <>
                  <Save size={18} /> Lưu thông tin
                </>
              )}
            </button>
          </form>
        </div>

        {/* Đổi mật khẩu */}
        <div className="zl-card zl-card--hover zl-reveal zl-reveal--d2" ref={pwdRef}>
          <div className="zl-card__head">
            <h2 className="zl-card__title">
              <KeyRound className="zl-card__icon" size={20} />
              Đổi mật khẩu
            </h2>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="doctor-input-group">
              <label className="doctor-label">Mật khẩu hiện tại</label>
              <div className="doctor-input-wrapper">
                <Lock className="doctor-input-icon" />
                <input
                  type="password"
                  name="currentPassword"
                  className="doctor-input"
                  placeholder="Nhập mật khẩu hiện tại"
                  value={pwd.currentPassword}
                  onChange={handlePwdChange}
                  autoComplete="current-password"
                />
              </div>
            </div>

            <div className="doctor-input-row">
              <div className="doctor-input-group">
                <label className="doctor-label">Mật khẩu mới</label>
                <div className="doctor-input-wrapper">
                  <Lock className="doctor-input-icon" />
                  <input
                    type="password"
                    name="newPassword"
                    className="doctor-input"
                    placeholder="Ít nhất 6 ký tự"
                    value={pwd.newPassword}
                    onChange={handlePwdChange}
                    autoComplete="new-password"
                  />
                </div>
              </div>
              <div className="doctor-input-group">
                <label className="doctor-label">Xác nhận mật khẩu mới</label>
                <div className="doctor-input-wrapper">
                  <Lock className="doctor-input-icon" />
                  <input
                    type="password"
                    name="confirmPassword"
                    className="doctor-input"
                    placeholder="Nhập lại mật khẩu mới"
                    value={pwd.confirmPassword}
                    onChange={handlePwdChange}
                    autoComplete="new-password"
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="zl-btn zl-btn--violet zl-btn--block zl-btn--lg" disabled={isChangingPwd}>
              {isChangingPwd ? (
                <>
                  <span className="spinner"></span> Đang đổi mật khẩu...
                </>
              ) : (
                <>
                  <KeyRound size={18} /> Đổi mật khẩu
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
