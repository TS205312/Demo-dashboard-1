import { useEffect } from 'react';

const COLOR_MAP = {
  info: 'bg-medical-600',
  success: 'bg-emerald-600',
  error: 'bg-red-500',
  warning: 'bg-amber-500',
};

export default function Toast({ message, type = 'info', onClose }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, 3500);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  const bg = COLOR_MAP[type] || COLOR_MAP.info;

  return (
    <div className={`fixed bottom-6 right-6 z-[99999] ${bg} text-white px-5 py-3 rounded-2xl shadow-2xl text-sm font-medium flex items-center gap-3 fade-slide-up max-w-sm`}>
      <i className="fa-solid fa-circle-info text-white/80"></i>
      {message}
    </div>
  );
}

