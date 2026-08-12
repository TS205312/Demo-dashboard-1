import { useEffect, useRef, useState } from 'react';

/**
 * Hook đếm số tăng dần khi phần tử lọt vào viewport.
 * @param {number} target - Giá trị đích
 * @param {number} [duration=1400] - Thời gian animation (ms)
 * @param {number} [delay=0] - Trễ trước khi bắt đầu (ms)
 * @returns {[number, React.RefObject]} [giá trị hiển thị, ref để gắn IntersectionObserver]
 */
export default function useCountUp(target, duration = 1400, delay = 0) {
  const ref = useRef(null);
  const [value, setValue] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    startedRef.current = false;

    if (typeof IntersectionObserver === 'undefined') {
      const frame = requestAnimationFrame(() => setValue(target));
      return () => cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || startedRef.current) return;
          startedRef.current = true;
          observer.unobserve(el);

          const start = performance.now() + delay;
          const from = 0;

          const tick = (now) => {
            if (now < start) {
              requestAnimationFrame(tick);
              return;
            }
            const progress = Math.min((now - start) / duration, 1);
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round(from + (target - from) * eased));
            if (progress < 1) requestAnimationFrame(tick);
          };

          requestAnimationFrame(tick);
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration, delay]);

  return [value, ref];
}
