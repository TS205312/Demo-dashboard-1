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

/**
 * Tài khoản — cập nhật hồ sơ bác sĩ + đổi mật khẩu (trong modal)
 */
export default function ProfilePage({ user, onUpdated, onNotify }) {
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
    <div className="space-y-6">
      {/* Profile summary */}
      <div className="flex items-center gap-4 rounded-2xl border border-[#24334f] bg-[rgba(13,21,38,0.6)] p-4">
        <div className="profile-avatar-wrap m-0">
          <div className="profile-avatar" style={{ width: 64, height: 64, borderRadius: 20 }}>
            <Stethoscope size={30} />
          </div>
          <span className="profile-status-dot" title="Đang hoạt động"></span>
        </div>
        <div className="min-w-0">
          <h2 className="profile-name truncate">{user?.name || 'Bác sĩ'}</h2>
          <p className="profile-role">
            <BadgeCheck size={13} /> Tài khoản đã xác thực
          </p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-muted">
            <span className="inline-flex items-center gap-1"><Mail size={12} /> {user?.email || '--'}</span>
            <span className="inline-flex items-center gap-1"><IdCard size={12} /> {user?.doctor_id || 'Chưa có mã'}</span>
            <span className="inline-flex items-center gap-1"><Building2 size={12} /> {user?.department || '--'}</span>
            <span className="inline-flex items-center gap-1"><Hospital size={12} /> {user?.hospital || '--'}</span>
            <span className="inline-flex items-center gap-1"><Phone size={12} /> {user?.phone || '--'}</span>
          </div>
        </div>
      </div>

      <div className="profile-tip">
        <ShieldCheck size={18} />
        <p>
          Thông tin bác sĩ sẽ được gắn tự động vào mỗi đơn hàng vận chuyển để
          trung tâm điều phối xác minh nhanh hơn.
        </p>
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

      {/* Edit info */}
      <div>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-ink">
          <UserRound size={16} className="text-[#22d3ee]" /> Thông tin tài khoản
        </h3>

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

      {/* Change password */}
      <div>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-ink">
          <KeyRound size={16} className="text-[#22d3ee]" /> Đổi mật khẩu
        </h3>

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
  );
}
