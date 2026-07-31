const API_KEY = '61061335ca387b0b9e3c981c91d96e54';
const GEOCODE_URL = 'https://api.positionstack.com/v1';

// Tự động chọn backend URL
const getBackendUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  return 'http://127.0.0.1:3001/api';
};

const BACKEND_URL = getBackendUrl();

/**
 * Reverse geocode: Get address from latitude/longitude
 */
export async function reverseGeocode(lat, lng) {
  try {
    const response = await fetch(
      `${GEOCODE_URL}/reverse?access_key=${API_KEY}&query=${lat},${lng}&limit=1&output=json`
    );
    if (!response.ok) return null;
    const data = await response.json();
    if (data.data && data.data.length > 0) {
      const result = data.data[0];
      return {
        label: result.label || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        name: result.name || '',
        city: result.locality || result.county || '',
        region: result.region || '',
        country: result.country || '',
      };
    }
    return null;
  } catch (err) {
    console.error('Reverse geocode error:', err);
    return null;
  }
}

/**
 * Forward geocode
 */
export async function forwardGeocode(query) {
  try {
    const response = await fetch(
      `${GEOCODE_URL}/forward?access_key=${API_KEY}&query=${encodeURIComponent(query)}&limit=5&output=json`
    );
    if (!response.ok) return [];
    const data = await response.json();
    if (data.data && data.data.length > 0) {
      return data.data.map((item) => ({
        lat: item.latitude,
        lng: item.longitude,
        label: item.label || item.name,
      }));
    }
    return [];
  } catch (err) {
    console.error('Forward geocode error:', err);
    return [];
  }
}

// ========== SAH-TECH BACKEND API ==========

/**
 * Đăng nhập
 */
export async function apiLogin(email, password) {
  try {
    const res = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return await res.json();
  } catch (err) {
    console.error('Login API error:', err);
    return { success: false, message: 'Lỗi kết nối server' };
  }
}

/**
 * Đăng ký
 */
export async function apiRegister(name, email, password) {
  try {
    const res = await fetch(`${BACKEND_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    return await res.json();
  } catch (err) {
    console.error('Register API error:', err);
    return { success: false, message: 'Lỗi kết nối server' };
  }
}

/**
 * Lấy danh sách đơn hàng từ backend
 */
export async function apiFetchOrders(status = null) {
  try {
    let url = `${BACKEND_URL}/orders?limit=50`;
    if (status) url += `&status=${status}`;
    const res = await fetch(url);
    const data = await res.json();
    return data.success ? data.data : [];
  } catch (err) {
    console.error('Fetch orders error:', err);
    return [];
  }
}

/**
 * Lấy danh sách drones từ backend
 */
export async function apiFetchDrones(status = null) {
  try {
    let url = `${BACKEND_URL}/drones`;
    if (status) url += `?status=${status}`;
    const res = await fetch(url);
    const data = await res.json();
    return data.success ? data.data : [];
  } catch (err) {
    console.error('Fetch drones error:', err);
    return [];
  }
}

/**
 * Lấy active mission
 */
export async function apiFetchActiveMission() {
  try {
    const res = await fetch(`${BACKEND_URL}/missions/active`);
    const data = await res.json();
    return data.success ? data.data : null;
  } catch (err) {
    console.error('Fetch active mission error:', err);
    return null;
  }
}

/**
 * Tạo mission mới
 */
export async function apiCreateMission(orderId, droneId, destination, destLat, destLng) {
  try {
    const res = await fetch(`${BACKEND_URL}/missions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_id: orderId,
        drone_id: droneId,
        destination,
        destination_lat: destLat,
        destination_lng: destLng,
      }),
    });
    return await res.json();
  } catch (err) {
    console.error('Create mission error:', err);
    return { success: false, message: 'Lỗi kết nối server' };
  }
}

/**
 * Cập nhật trạng thái mission
 */
export async function apiUpdateMissionStatus(missionId, status) {
  try {
    const res = await fetch(`${BACKEND_URL}/missions/${missionId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return await res.json();
  } catch (err) {
    console.error('Update mission status error:', err);
    return { success: false, message: 'Lỗi kết nối server' };
  }
}

/**
 * Thêm log cho mission
 */
export async function apiAddMissionLog(missionId, logType, tag, message) {
  try {
    const res = await fetch(`${BACKEND_URL}/missions/${missionId}/logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ log_type: logType, tag, message }),
    });
    return await res.json();
  } catch (err) {
    console.error('Add mission log error:', err);
    return { success: false, message: 'Lỗi kết nối server' };
  }
}

/**
 * Cập nhật telemetry drone
 */
export async function apiUpdateDroneTelemetry(droneId, telemetry) {
  try {
    const res = await fetch(`${BACKEND_URL}/drones/${droneId}/telemetry`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(telemetry),
    });
    return await res.json();
  } catch (err) {
    console.error('Update drone telemetry error:', err);
    return { success: false, message: 'Lỗi kết nối server' };
  }
}
