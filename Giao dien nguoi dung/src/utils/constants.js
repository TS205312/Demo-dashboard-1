/**
 * SAH-TECH Configuration
 * Tự động chọn API URL dựa trên môi trường
 */

// Nếu chạy trên Render, dùng biến môi trường VITE_API_URL
// Nếu chạy local, dùng localhost
const getApiBase = () => {
  if (import.meta.env.VITE_API_URL) {
    let url = import.meta.env.VITE_API_URL.trim().replace(/\/+$/, '');
    if (!url.endsWith('/api')) {
      url += '/api';
    }
    return url;
  }
  return 'http://127.0.0.1:3001/api';
};

const getWsUrl = () => {
  if (import.meta.env.VITE_WS_URL) {
    let url = import.meta.env.VITE_WS_URL.trim().replace(/\/+$/, '');
    if (!url.endsWith('/ws')) {
      url += '/ws';
    }
    return url;
  }
  return 'ws://127.0.0.1:3001/ws';
};

/** Base URL cho Backend API */
export const API_BASE = getApiBase();

/** WebSocket URL */
export const WS_URL = getWsUrl();

/** Default coordinates: Ho Chi Minh City area (Bệnh viện Chợ Rẫy approx). */
export const DEFAULT_CENTER = [10.759, 106.664];

/** Hospital location (SAH-TECH Hub / dropoff point) */
export const HOSPITAL_POS = [10.759, 106.664];

/** Destination coordinates (mock) */
export const DESTINATIONS = {
  'Bệnh viện Chợ Rẫy': [10.759, 106.664],
  'Bệnh viện Từ Dũ': [10.768, 106.690],
  'Bệnh viện Nhi Đồng 1': [10.762, 106.679],
  'Bệnh viện Nhi Đồng 2': [10.778, 106.702],
  'Bệnh viện Đại học Y Dược': [10.750, 106.676],
  'Bệnh viện Nhân dân 115': [10.770, 106.660],
  'Bệnh viện Thống Nhất': [10.777, 106.672],
  'Trạm y tế quận Bình Thạnh': [10.803, 106.708],
};

/** Timeline steps in order. */
export const TIMELINE_STEPS = ['received', 'packaging', 'departed', 'inflight', 'delivered'];

/** Step labels in Vietnamese. */
export const STEP_LABELS = {
  received: 'Đã tiếp nhận',
  packaging: 'Đóng gói',
  departed: 'Drone cất cánh',
  inflight: 'Đang bay',
  delivered: 'Đã giao thành công',
};

/** Mapping from API status string to timeline step key. */
export const STATUS_TO_STEP = {
  pending: 'received',
  packaging: 'packaging',
  departed: 'departed',
  inflight: 'inflight',
  delivered: 'delivered',
};

/** Badge class mapping. */
export const STATUS_BADGE_MAP = {
  pending: 'badge-pending',
  packaging: 'badge-packaging',
  departed: 'badge-departed',
  inflight: 'badge-inflight',
  delivered: 'badge-delivered',
};

export const STATUS_LABEL_MAP = {
  pending: 'Chờ xử lý',
  packaging: 'Đang đóng gói',
  departed: 'Đã cất cánh',
  inflight: 'Đang bay',
  delivered: 'Đã giao',
};
