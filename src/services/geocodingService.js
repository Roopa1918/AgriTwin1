// AgriTwin — Geocoding & Field Area Calculation Service
// Integrates OpenStreetMap Nominatim search, reverse geocoding, and geodesic acreage computation

/**
 * Search locations using OpenStreetMap Nominatim
 * Supports Village, Town, District, City, Landmark, PIN code
 */
export async function searchLocations(query) {
  if (!query || query.trim().length < 2) return [];

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=6`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Accept-Language': 'en',
        'User-Agent': 'AgriTwin-SmartAgri-DigitalTwin/2.0'
      }
    });
    
    if (!response.ok) return [];
    const data = await response.json();

    return data.map(item => {
      const addr = item.address || {};
      const village = addr.village || addr.hamlet || addr.suburb || addr.town || addr.city || addr.county || item.name;
      const state = addr.state || addr.country || '';
      const formattedName = [village, state].filter(Boolean).join(', ');

      return {
        id: item.place_id,
        name: formattedName || item.display_name.split(',')[0],
        displayName: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        type: item.type || 'place'
      };
    });
  } catch (err) {
    console.warn('[AgriTwin Geocoding] Search error:', err);
    return [];
  }
}

/**
 * Reverse geocode coordinates to get village/district name
 */
export async function reverseGeocode(lat, lng) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`;
  try {
    const response = await fetch(url, {
      headers: {
        'Accept-Language': 'en',
        'User-Agent': 'AgriTwin-SmartAgri-DigitalTwin/2.0'
      }
    });
    if (!response.ok) return `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`;
    const data = await response.json();
    const addr = data.address || {};
    const locality = addr.village || addr.hamlet || addr.suburb || addr.town || addr.city || addr.county;
    const district = addr.state_district || addr.county || addr.state;
    return [locality, district].filter(Boolean).join(', ') || data.display_name.split(',').slice(0, 2).join(',');
  } catch (e) {
    return `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`;
  }
}

/**
 * Calculate acreage from a polygon coordinates array [[lat, lng], [lat, lng], ...]
 * Uses planar projection approximation accurate for farm scales (< 10,000 acres)
 */
export function calculatePolygonAcres(coords) {
  if (!coords || coords.length < 3) return 0;

  const R = 6378137; // Earth radius in meters
  const centerLat = coords.reduce((sum, p) => sum + p[0], 0) / coords.length;
  const latFactor = (centerLat * Math.PI) / 180;
  const cosLat = Math.cos(latFactor);

  // Project lat/lon to planar meters (x, y)
  const projected = coords.map(([lat, lng]) => {
    const x = (lng * Math.PI / 180) * R * cosLat;
    const y = (lat * Math.PI / 180) * R;
    return [x, y];
  });

  // Shoelace formula for polygon area
  let area = 0;
  const n = projected.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += projected[i][0] * projected[j][1];
    area -= projected[j][0] * projected[i][1];
  }
  const areaSqMeters = Math.abs(area) / 2.0;

  // Convert square meters to acres (1 acre = 4046.8564224 m²)
  const acres = areaSqMeters / 4046.8564224;
  
  // Return formatted number rounded to 1 or 2 decimals
  return Math.max(0.1, parseFloat(acres.toFixed(2)));
}
