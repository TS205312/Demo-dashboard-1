import { useEffect, useRef } from 'react';

export default function Navbar({ user, onLogout }) {
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
        <div className="flex h-[76px] items-center justify-between">
          {/* Logo / Brand */}
          <div className="flex min-w-0 items-center gap-3.5">
            <div className="sah-logo-glow shrink-0">
              <img src="/sah-logo.png" alt="SAH-TECH" className="sah-logo-pulse" style={{ width: 40, height: 40, objectFit: 'contain' }} />
            </div>
            <div className="hidden min-w-0 sm:block">
              <p className="text-sm font-extrabold text-white leading-tight tracking-tight">SAH-TECH Medical</p>
              <p className="text-[11px] text-white/50 font-medium leading-tight">Cổng đặt hàng Y tế</p>
            </div>
          </div>

          {/* Right: Doctor info & status */}
          <div className="flex shrink-0 items-center gap-2.5 sm:gap-4">
            <div className="hidden items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-3 py-1.5 text-xs text-white/80 backdrop-blur-md sm:flex">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block pulse-blue"></span>
              Hệ thống trực tuyến
            </div>

            {/* Logged-in doctor */}
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#643aed] text-xs font-bold text-white shadow-lg shadow-violet-600/30 ring-1 ring-white/20">
                <i className="fa-solid fa-user-md"></i>
              </div>
              <div className="hidden text-right sm:block">
                <p className="text-xs font-bold text-white leading-tight">
                  {displayName}
                  {doctorId ? <span className="text-[10px] text-violet-300 ml-1 font-mono">({doctorId})</span> : null}
                </p>
                <p className="text-[10px] text-white/50 leading-tight">{department}</p>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={onLogout}
              title="Đăng xuất"
              className="flex items-center gap-1.5 rounded-full border border-white/25 bg-transparent px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-white hover:text-black"
            >
              <i className="fa-solid fa-right-from-bracket"></i>
              <span className="hidden md:inline">Đăng xuất</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
