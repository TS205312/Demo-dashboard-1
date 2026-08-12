import { useEffect } from 'react';
import { AlertTriangle, CircleAlert, CircleCheckBig, Info } from 'lucide-react';

const COLOR_MAP = {
  info: 'toast-info',
  success: 'toast-success',
  error: 'toast-error',
  warning: 'toast-warning',
};

const ICON_MAP = {
  info: Info,
  success: CircleCheckBig,
  error: CircleAlert,
  warning: AlertTriangle,
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
  const Icon = ICON_MAP[type] || Info;

  return (
    <div className={`toast fade-slide-up ${tint}`}>
      <Icon size={16} />
      {message}
    </div>
  );
}
