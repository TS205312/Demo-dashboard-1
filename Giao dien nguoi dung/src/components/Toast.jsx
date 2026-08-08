import { useEffect } from 'react';

const COLOR_MAP = {
  info: 'toast-info',
  success: 'toast-success',
  error: 'toast-error',
  warning: 'toast-warning',
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

  const tint = COLOR_MAP[type] || COLOR_MAP.info;

  return (
    <div className={`toast glass fade-slide-up ${tint}`}>
      <i className="fa-solid fa-circle-info text-white/80"></i>
      {message}
    </div>
  );
}

