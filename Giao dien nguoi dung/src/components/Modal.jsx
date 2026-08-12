import { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Modal chung cho Command Center — overlay tối, panel kính, đóng bằng ESC/click nền
 */
export default function Modal({ show, onClose, title, icon: Icon, children, large, footer }) {
  useEffect(() => {
    if (!show) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="modal-overlay active" role="dialog" aria-modal="true" onClick={onClose}>
      <div
        className={`modal-panel ${large ? 'modal-panel--lg' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <h3 className="modal-title">
            {Icon && <Icon size={20} />}
            {title}
          </h3>
          <button className="modal-close" onClick={onClose} aria-label="Đóng" title="Đóng (ESC)">
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}
