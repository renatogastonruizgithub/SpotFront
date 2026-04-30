import { useApi } from '../ApiContext';
import { distanceMeters } from '../lib/geo';

/** Normaliza filas del API al shape que usa el mapa (`MapViewGL`). */
function toMapBar(row) {
  if (!row || typeof row !== 'object') return null;
  const lat = Number(row.lat ?? row.Lat ?? row.location_lat ?? row.Location_lat);
  const lng = Number(row.lng ?? row.Lng ?? row.location_lng ?? row.Location_lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  const d = row.distancia ?? row.Distancia;
  return {
    id_negocio: row.id_negocio,
    razon_social: row.razon_social,
    direccion: row.direccion,
    lat,
    lng,
    distancia: d != null && Number.isFinite(Number(d)) ? Number(d) : undefined,
  };
}

export const useGetNegocios = () => {
  const { get, post } = useApi();
  const endpoint = '/api/negocios';

  const listarNegocios = async () => {
    return await get(endpoint);
  };
  const listarUnNegocio = async (id) => {
    return await get(`${endpoint}/${id}`);
  };

  const postNegocio = async (data) => {
    return await post(endpoint, data);
  };

  /**
   * Backend a veces devuelve 404 cuando no hay filas (debería ser 200 + []).
   * Además GET api/negocios puede devolver un solo DTO; lo usamos como respaldo con Haversine.
   */
  const buscarNegociosCercanos = async (lat, lng, radioKm) => {
    const radioM = Number(radioKm) * 1000;
    const q = `${endpoint}/cercanos?lat=${lat}&lng=${lng}&radioKm=${radioKm}`;

    let list = await get(q, { treat404AsEmpty: true });
    if (!Array.isArray(list)) list = list ? [list] : [];

    const mapped = list.map(toMapBar).filter(Boolean);
    if (mapped.length > 0) return mapped;

    const broad = await get(endpoint, { treat404AsEmpty: true });
    const candidates = Array.isArray(broad) ? broad : broad ? [broad] : [];
    const out = [];
    for (const row of candidates) {
      const bar = toMapBar(row);
      if (!bar) continue;
      const d =
        bar.distancia != null
          ? bar.distancia
          : distanceMeters(lat, lng, bar.lat, bar.lng);
      if (d <= radioM) out.push({ ...bar, distancia: d });
    }
    out.sort((a, b) => (a.distancia ?? 0) - (b.distancia ?? 0));
    return out;
  };
  /*
  const eliminarNegocio = async (id) => {
    return await del(`${endpoint}/${id}`);
  }; */
  return {
    listarNegocios,
    listarUnNegocio,
    postNegocio,
    buscarNegociosCercanos,
 /*    putNegocio,
    eliminarNegocio */
  };

  
}