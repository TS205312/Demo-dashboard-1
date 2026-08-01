import { useEffect, useRef } from 'react';

export default function Navbar() {
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

  return (
    <nav className="navbar" id="navbar" ref={navbarRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-medical-600 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-md">
              <i className="fa-solid fa-heart-pulse text-lg"></i>
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-slate-800 leading-tight">SAH-TECH Medical</p>
              <p className="text-[11px] text-slate-400 font-medium leading-tight">Cổng đặt hàng Y tế</p>
            </div>
          </div>

          {/* Right: Doctor info & status */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
              Hệ thống trực tuyến
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-medical-400 to-medical-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                <i className="fa-solid fa-user-md"></i>
              </div>
              <div className="hidden sm:block text-right">
                <p className="text-xs font-semibold text-slate-700 leading-tight">BS. Nguyễn Văn An</p>
                <p className="text-[10px] text-slate-400 leading-tight">Khoa Cấp cứu</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

