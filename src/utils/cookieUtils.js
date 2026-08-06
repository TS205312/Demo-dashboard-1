/**
 * Cookie Utilities for SAH Dashboard
 * Manages browser cookies for session persistence
 */

/**
 * Set a cookie with a given name, value, and expiration in days.
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 * @param {number} days - Number of days until expiry
 */
export function setCookie(name, value, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

/**
 * Get a cookie value by name.
 * @param {string} name - Cookie name
 * @returns {string|null} Cookie value or null if not found
 */
export function getCookie(name) {
  const cookies = document.cookie.split('; ');
  for (const cookie of cookies) {
    const [key, ...valParts] = cookie.split('=');
    if (key === name) {
      return decodeURIComponent(valParts.join('='));
    }
  }
  return null;
}

/**
 * Delete a cookie by name.
 * @param {string} name - Cookie name
 */
export function deleteCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
}
