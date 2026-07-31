/**
 * API Client for SAH-TECH Backend
 * Kết nối đến Express + MongoDB server
 */

import { API_BASE } from './constants.js';

/**
 * Tạo đơn hàng mới
 */
export async function apiCreateOrder(payload) {
  try {
    const response = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        medical_item: payload.medical_item || payload.medicalItem,
        destination: payload.destination,
        urgency: payload.urgency,
        notes: payload.notes || '',
      }),
    });
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('apiCreateOrder error:', error);
    return { success: false, message: 'Lỗi kết nối server' };
  }
}

/**
 * Lấy danh sách đơn hàng
 */
export async function apiFetchOrders(status = null) {
  try {
    let url = `${API_BASE}/orders?limit=50`;
    if (status) url += `&status=${status}`;
    const response = await fetch(url);
    const result = await response.json();
    if (result.success) return result.data;
    return [];
  } catch (error) {
    console.error('apiFetchOrders error:', error);
    return [];
  }
}

/**
 * Lấy chi tiết đơn hàng
 */
export async function apiGetOrder(id) {
  try {
    const response = await fetch(`${API_BASE}/orders/${id}`);
    const result = await response.json();
    return result.success ? result.data : null;
  } catch (error) {
    console.error('apiGetOrder error:', error);
    return null;
  }
}

/**
 * Lưu orders vào localStorage (fallback local)
 */
export function saveOrders(updatedOrders) {
  try {
    localStorage.setItem('sah_orders', JSON.stringify(updatedOrders));
  } catch (e) { /* ignore */ }
}

/**
 * Lấy orders từ localStorage (fallback local)
 */
export function getOrders() {
  try {
    const stored = localStorage.getItem('sah_orders');
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
}
