const API_KEY = '61061335ca387b0b9e3c981c91d96e54';
const BASE_URL = 'https://api.positionstack.com/v1';

/**
 * Reverse geocode: Get address from latitude/longitude
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<{label: string, name: string, city: string, region: string, country: string}|null>}
 */
export async function reverseGeocode(lat, lng) {
  try {
    const response = await fetch(
      `${BASE_URL}/reverse?access_key=${API_KEY}&query=${lat},${lng}&limit=1&output=json`
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
 * Forward geocode: Get coordinates from address/query
 * @param {string} query - Address or place name to search
 * @returns {Promise<Array<{lat: number, lng: number, label: string}>>}
 */
export async function forwardGeocode(query) {
  try {
    const response = await fetch(
      `${BASE_URL}/forward?access_key=${API_KEY}&query=${encodeURIComponent(query)}&limit=5&output=json`
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

