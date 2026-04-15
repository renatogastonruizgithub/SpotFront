/**
 * Construye una URL absoluta sin dobles barras.
 * @param {string} path - Ruta que empieza con / (ej. `/api/usuarios` o `/Auth/login`)
 */
export function apiUrl(path) {
  const raw = import.meta.env.VITE_API_BASE_URL ?? ""
  const base = String(raw).replace(/\/+$/, "")
  const p = path.startsWith("/") ? path : `/${path}`
  if (!base) return p
  return `${base}${p}`
}
