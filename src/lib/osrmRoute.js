/**
 * Ruta por calles vía OSRM (Open Source Routing Machine).
 * En desarrollo: usa proxy de Vite `/osrm` → router.project-osrm.org
 * En producción: definí `VITE_OSRM_URL` (ej. https://router.project-osrm.org) o mismo origen con proxy reverso.
 *
 * @param {[number, number]} fromLngLat [lng, lat]
 * @param {[number, number]} toLngLat [lng, lat]
 * @param {'driving'|'walking'} profile
 * @returns {Promise<GeoJSON.Feature<GeoJSON.LineString> | null>}
 */
export async function fetchOsrmRoute(fromLngLat, toLngLat, profile = "driving") {
  const [lng1, lat1] = fromLngLat
  const [lng2, lat2] = toLngLat
  const base = import.meta.env.DEV
    ? "/osrm"
    : (import.meta.env.VITE_OSRM_URL?.replace(/\/$/, "") ||
        "https://router.project-osrm.org")
  const url = `${base}/route/v1/${profile}/${lng1},${lat1};${lng2},${lat2}?overview=full&geometries=geojson`

  const res = await fetch(url)
  if (!res.ok) return null
  const data = await res.json()
  if (data.code !== "Ok" || !data.routes?.[0]?.geometry) return null

  const geometry = data.routes[0].geometry
  if (geometry.type !== "LineString" || !Array.isArray(geometry.coordinates)) return null

  return {
    type: "Feature",
    properties: { source: "osrm", profile },
    geometry,
  }
}
