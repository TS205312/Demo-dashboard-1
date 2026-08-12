import { useEffect, useRef } from 'react';
import { ChevronDown, History, LogOut, Stethoscope, UserCog } from 'lucide-react';

/**
 * Command Bar — navbar dark: logo + trạng thái hệ thống + nút Lịch sử/Tài khoản/Đăng xuất
 */
export default function Navbar({ user, onLogout, onOpenHistory, onOpenAccount }) {
  const navbarRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const el = navbarRef.current;
      if (!el) return;
      if (window.scrollY > 10) {
        el.classList.add('scrolled');
      } else {
        el.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const displayName = user?.name || 'Bác sĩ';
  const department = user?.department || 'Khoa Cấp cứu';
  const doctorId = user?.doctor_id || '';

  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');

  return (
    <nav className="cc-bar" id="navbar" ref={navbarRef}>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="cc-bar__inner">
          {/* Brand */}
          <div className="cc-bar__left">
            <div className="cc-logo-glow shrink-0">
              <img src="/sah-logo.png" alt="SAH-TECH" className="cc-logo-pulse" style={{ width: 40, height: 40, objectFit: 'contain' }} />
            </div>
            <div className="cc-brand-text hidden min-w-0 sm:block">
              <p className="text-sm font-extrabold text-ink leading-tight tracking-tight">SAH-TECH Command Center</p>
              <p className="text-[11px] text-ink-muted font-medium leading-tight">Điều phối vận chuyển y tế bằng Drone</p>
            </div>
          </div>

          {/* Right */}
          <div className="cc-bar__right">
            <span className="cc-status-pill hidden lg:inline-flex">
              <span className="cc-status-dot"></span>
              Hệ thống trực tuyến
            </span>

            <button
              type="button"
              onClick={onOpenHistory}
              className="cc-btn"
              title="Lịch sử đơn hàng"
            >
              <History size={15} />
              <span className="cc-btn__label hidden md:inline">Lịch sử</span>
            </button>

            <button
              type="button"
              onClick={onOpenAccount}
              className="nav-account-btn"
              title="Quản lý tài khoản"
            >
              <span className="nav-avatar">{initials || <Stethoscope className="w-4 h-4" />}</span>
              <span className="hidden text-right sm:block">
                <span className="block text-xs font-bold text-ink leading-tight">
                  {displayName}
                  {doctorId ? <span className="text-[10px] text-cyan-300 ml-1 font-mono">({doctorId})</span> : null}
                </span>
                <span className="block text-[10px] text-ink-muted leading-tight">{department}</span>
              </span>
              <ChevronDown className="nav-account-chevron hidden sm:block" size={14} />
            </button>

            <span className="hidden h-6 w-px bg-[#24334f] sm:block" aria-hidden="true"></span>

            <button
              onClick={onLogout}
              title="Đăng xuất"
              className="cc-btn cc-btn--danger"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="cc-btn__label hidden md:inline">Đăng xuất</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
