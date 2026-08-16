// City coordinates lookup table for Philippine locations (Batangas & Calabarzon focused + default fallback)
const KNOWN_CITIES: Record<string, [number, number]> = {
  'lipa': [13.9416, 121.1622],
  'lipa city': [13.9416, 121.1622],
  'tanauan': [14.0833, 121.1500],
  'tanauan city': [14.0833, 121.1500],
  'batangas': [13.7565, 121.0583],
  'batangas city': [13.7565, 121.0583],
  'calamba': [14.2141, 121.1656],
  'calamba city': [14.2141, 121.1656],
  'santo tomas': [14.1086, 121.1417],
  'sto. tomas': [14.1086, 121.1417],
  'malvar': [14.0439, 121.1583],
  'bauan': [13.7917, 121.0117],
  'lemery': [13.8822, 120.9161],
  'nasugbu': [14.0722, 120.6300],
  'san jose': [13.8789, 121.1064],
  'rosario': [13.8458, 121.2069],
  'san pablo': [14.0683, 121.3256],
  'manila': [14.5995, 120.9842],
  'quezon city': [14.6760, 121.0437],
  'makati': [14.5547, 121.0244],
  'taguig': [14.5176, 121.0509],
}

/**
 * Synchronously calculate coordinates for a pharmacy based on its location and index
 * to guarantee pins never stack on top of each other.
 */
export function getFastCoordinates(location: string, index: number): { lat: number; lng: number } {
  const cleanLoc = (location || '').trim().toLowerCase()
  for (const [key, coords] of Object.entries(KNOWN_CITIES)) {
    if (cleanLoc.includes(key)) {
      const offsetLat = ((index % 5) - 2) * 0.007
      const offsetLng = (Math.floor(index / 5) - 1) * 0.007
      return { lat: coords[0] + offsetLat, lng: coords[1] + offsetLng }
    }
  }
  const offsetLat = ((index % 5) - 2) * 0.015
  const offsetLng = (Math.floor(index / 5) - 1) * 0.015
  return { lat: 14.0 + offsetLat, lng: 121.15 + offsetLng }
}

/**
 * Get coordinates for a location string.
 * Uses Nominatim API if available, with a reliable fallback to local city coordinates
 * plus a small micro-jitter so multiple pharmacies in the same city do not overlap.
 */
export async function resolveCoordinates(location: string): Promise<{ lat: number; lng: number }> {
  const cleanLoc = location.trim().toLowerCase()

  // 1. Try Nominatim Geocoding API first for maximum real-world accuracy
  try {
    const query = encodeURIComponent(`${location}, Philippines`)
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`, {
      headers: {
        'Accept-Language': 'en',
      },
    })
    if (res.ok) {
      const data = await res.json()
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat)
        const lng = parseFloat(data[0].lon)
        if (!isNaN(lat) && !isNaN(lng)) {
          const jitterLat = (Math.random() - 0.5) * 0.006
          const jitterLng = (Math.random() - 0.5) * 0.006
          return { lat: lat + jitterLat, lng: lng + jitterLng }
        }
      }
    }
  } catch (err) {
    console.warn('Geocoding API unavailable, using local lookup fallback:', err)
  }

  // 2. Fallback to local city dictionary
  for (const [key, coords] of Object.entries(KNOWN_CITIES)) {
    if (cleanLoc.includes(key)) {
      const jitterLat = (Math.random() - 0.5) * 0.008
      const jitterLng = (Math.random() - 0.5) * 0.008
      return { lat: coords[0] + jitterLat, lng: coords[1] + jitterLng }
    }
  }

  // 3. Default fallback
  const defaultLat = 14.0 + (Math.random() - 0.5) * 0.08
  const defaultLng = 121.15 + (Math.random() - 0.5) * 0.08
  return { lat: defaultLat, lng: defaultLng }
}
