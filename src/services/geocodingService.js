// AgriTwin — Advanced Geocoding & Place Search Service
// Supports OpenStreetMap Nominatim with higher limit, Photon fallback, distance calculation,
// and full landmark support (e.g. GKVK, Universities, Research Farms, Villages, PIN codes).

/**
 * Calculate distance between two coordinates in kilometers (Haversine formula)
 */
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d < 10 ? d.toFixed(1) : Math.round(d);
}

/**
 * Advanced place search supporting landmarks, campuses, towns, districts, addresses, and PIN codes.
 * Returns a rich, scrollable list of up to 20 results (not limited to 3).
 */
export async function searchLocations(query, userCoords = null, limit = 20) {
  if (!query || query.trim().length < 2) return [];

  const cleanQuery = query.trim();
  const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanQuery)}&addressdetails=1&limit=${limit}`;

  try {
    const response = await fetch(nominatimUrl, {
      headers: {
        'Accept-Language': 'en',
        'User-Agent': 'AgriTwin-SmartAgri-DigitalTwin/2.0'
      }
    });

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map(item => {
          const addr = item.address || {};
          const primaryName = addr.amenity || addr.university || addr.college || addr.building || 
                              addr.village || addr.hamlet || addr.suburb || addr.town || addr.city || 
                              item.name || item.display_name.split(',')[0];

          const locality = [
            addr.suburb || addr.neighbourhood || addr.village || addr.town,
            addr.city || addr.county || addr.state_district,
            addr.state
          ].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(', ');

          const lat = parseFloat(item.lat);
          const lng = parseFloat(item.lon);
          const distance = userCoords ? calculateDistanceKm(userCoords.lat, userCoords.lng, lat, lng) : null;

          return {
            id: item.place_id || `${lat}-${lng}`,
            name: primaryName || item.display_name.split(',')[0],
            address: locality || item.display_name,
            displayName: item.display_name,
            lat,
            lng,
            distance: distance ? `${distance} km away` : null,
            type: item.type || item.class || 'location'
          };
        });
      }
    }
  } catch (err) {
    console.warn('[AgriTwin Nominatim] Primary search error, trying Photon fallback:', err);
  }

  // Fallback: Photon API (Fast OSM Elasticsearch index)
  try {
    const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(cleanQuery)}&limit=${limit}`;
    const response = await fetch(photonUrl);
    if (response.ok) {
      const data = await response.json();
      if (data && data.features) {
        return data.features.map((f, idx) => {
          const p = f.properties || {};
          const coords = f.geometry?.coordinates || [0, 0];
          const lat = coords[1];
          const lng = coords[0];
          const distance = userCoords ? calculateDistanceKm(userCoords.lat, userCoords.lng, lat, lng) : null;

          const primary = p.name || cleanQuery;
          const address = [p.city || p.district, p.state, p.country].filter(Boolean).join(', ');

          return {
            id: `photon-${idx}-${lat}-${lng}`,
            name: primary,
            address: address || 'Agricultural Region',
            displayName: [primary, address].filter(Boolean).join(', '),
            lat,
            lng,
            distance: distance ? `${distance} km away` : null,
            type: p.osm_value || 'place'
          };
        });
      }
    }
  } catch (fallbackErr) {
    console.warn('[AgriTwin Photon] Fallback search error:', fallbackErr);
  }

  return [];
}

/**
 * Reverse geocode coordinates to get village/district/landmark name
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
    const locality = addr.amenity || addr.village || addr.hamlet || addr.suburb || addr.town || addr.city || addr.county;
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
  
  return Math.max(0.1, parseFloat(acres.toFixed(2)));
}
