import { useEffect, useRef } from 'react';
import { ChevronDown, LogOut, Stethoscope } from 'lucide-react';

export default function Navbar({ user, onLogout, activeTab, onTabChange, tabBar }) {
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
    <nav className="navbar" id="navbar" ref={navbarRef}>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[76px] flex-wrap items-center justify-between gap-y-2">
          {/* Logo / Brand */}
          <div className="flex min-w-0 items-center gap-3.5">
            <div className="sah-logo-glow shrink-0">
              <img src="/sah-logo.png" alt="SAH-TECH" className="sah-logo-pulse" style={{ width: 40, height: 40, objectFit: 'contain' }} />
            </div>
            <div className="hidden min-w-0 sm:block">
              <p className="text-sm font-extrabold text-[#0f172a] leading-tight tracking-tight">SAH-TECH Medical</p>
              <p className="text-[11px] text-slate-500 font-medium leading-tight">Cổng đặt hàng Y tế</p>
            </div>
          </div>

          {/* Page tabs - same row as logo */}
          <div className="zl-navbar-center">{tabBar}</div>

          {/* Right: Doctor info & status */}
          <div className="flex shrink-0 items-center gap-2.5 sm:gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 lg:flex">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              Hệ thống trực tuyến
            </div>

            {/* Logged-in doctor -> opens Account tab */}
            <button
              type="button"
              onClick={() => onTabChange?.('account')}
              title="Quản lý tài khoản"
              className={`nav-account-btn ${activeTab === 'account' ? 'active' : ''}`}
            >
              <span className="nav-avatar">{initials || <Stethoscope className="w-4 h-4" />}</span>
              <span className="hidden text-right sm:block">
                <span className="block text-xs font-bold text-[#0f172a] leading-tight">
                  {displayName}
                  {doctorId ? <span className="text-[10px] text-cyan-700 ml-1 font-mono">({doctorId})</span> : null}
                </span>
                <span className="block text-[10px] text-slate-500 leading-tight">{department}</span>
              </span>
              <ChevronDown className="nav-account-chevron hidden sm:block" size={14} />
            </button>

            <span className="hidden h-6 w-px bg-slate-200 sm:block" aria-hidden="true"></span>

            {/* Logout button */}
            <button
              onClick={onLogout}
              title="Đăng xuất"
              className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 transition-all duration-200 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Đăng xuất</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
