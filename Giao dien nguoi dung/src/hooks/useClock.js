import { useState, useEffect } from 'react';

/**
 * Hook hiển thị đồng hồ live, cập nhật mỗi giây
 * @returns {string} Thời gian hiện tại (HH:MM:SS)
 */
export function useClock() {
  const [time, setTime] = useState(() => getCurrentTime());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getCurrentTime());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return time;
}

function getCurrentTime() {
  const now = new Date();
  return now.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

