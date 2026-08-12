import { useEffect, useRef } from 'react';

/**
 * Scroll reveal + 3D tilt:
 * - Element bắt đầu ẩn (opacity 0, translateY) và hiện lên khi vào viewport
 * - Nếu element có class `zl-card--hover`, gắn thêm hiệu ứng 3D tilt theo chuột
 *   (đặt biến CSS --rx / --ry để xoay card)
 */
export default function useReveal() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const isReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (!isReduced && typeof IntersectionObserver !== 'undefined') {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              el.classList.add('zl-revealed');
              observer.unobserve(el);
            }
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
      );
      observer.observe(el);
      return () => observer.disconnect();
    }

    // Fallback / reduced motion: hiện ngay
    el.classList.add('zl-revealed');
  }, []);

  // 3D tilt theo chuột cho card
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!el.classList.contains('zl-card--hover')) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    const handleMove = (e) => {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const rx = (0.5 - py) * 6; // độ nghiêng trục X
      const ry = (px - 0.5) * 8; // độ nghiêng trục Y
      el.style.setProperty('--rx', `${rx.toFixed(2)}deg`);
      el.style.setProperty('--ry', `${ry.toFixed(2)}deg`);
    };

    const handleLeave = () => {
      el.style.setProperty('--rx', '0deg');
      el.style.setProperty('--ry', '0deg');
    };

    el.addEventListener('mousemove', handleMove, { passive: true });
    el.addEventListener('mouseleave', handleLeave, { passive: true });
    return () => {
      el.removeEventListener('mousemove', handleMove);
      el.removeEventListener('mouseleave', handleLeave);
    };
  }, []);

  return ref;
}
