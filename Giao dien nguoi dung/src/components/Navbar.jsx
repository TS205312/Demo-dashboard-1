import { useEffect, useRef } from 'react';
import { Activity, LogOut, Stethoscope } from 'lucide-react';

export default function Navbar({ user, onLogout, tabBar }) {
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

  return (
    <nav className="navbar" id="navbar" ref={navbarRef}>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[76px] flex-wrap items-center justify-between">
          {/* Logo / Brand */}
          <div className="flex min-w-0 items-center gap-3.5">
            <div className="sah-logo-glow shrink-0">
              <img src="/sah-logo.png" alt="SAH-TECH" className="sah-logo-pulse" style={{ width: 40, height: 40, objectFit: 'contain' }} />
            </div>
            <div className="hidden min-w-0 sm:block">
              <p className="text-sm font-extrabold text-[#134e4a] leading-tight tracking-tight">SAH-TECH Medical</p>
              <p className="text-[11px] text-[#64748b] font-medium leading-tight">Cổng đặt hàng Y tế</p>
            </div>
          </div>

          {/* Page tabs - same row as logo */}
          <div className="zl-navbar-center">{tabBar}</div>

          {/* Right: Doctor info & status */}
          <div className="flex shrink-0 items-center gap-2.5 sm:gap-4">
            <div className="hidden items-center gap-2 rounded-full border border-[#d1fae5] bg-[#ecfdf5] px-3 py-1.5 text-xs text-[#15803d] sm:flex">
              <Activity className="w-3.5 h-3.5 pulse-blue" />
              Hệ thống trực tuyến
            </div>

            {/* Logged-in doctor */}
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0891b2] text-white shadow-md shadow-cyan-600/30 ring-1 ring-white/50">
                <Stethoscope className="w-4 h-4" />
              </div>
              <div className="hidden text-right sm:block">
                <p className="text-xs font-bold text-[#134e4a] leading-tight">
                  {displayName}
                  {doctorId ? <span className="text-[10px] text-[#0891b2] ml-1 font-mono">({doctorId})</span> : null}
                </p>
                <p className="text-[10px] text-[#64748b] leading-tight">{department}</p>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={onLogout}
              title="Đăng xuất"
              className="flex items-center gap-1.5 rounded-full border border-[#cbd5e1] bg-white px-4 py-2 text-xs font-bold text-[#134e4a] transition-colors hover:bg-[#f0fdfa] hover:border-[#0891b2] hover:text-[#0e7490] cursor-pointer"
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
