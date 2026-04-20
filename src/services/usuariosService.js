import { apiUrl } from "@/lib/apiUrl"
import { buildApiError } from "@/lib/apiError"

/**
 * Contrato backend definitivo:
 * POST /Auth/registrarUsuarios
 * Body: { email, contraseña, id_rol }
 */
const REGISTRO_PATH = "/Auth/registrarUsuarios"

/** Listado de roles (público en dev; si el API exige JWT, iniciá sesión antes). */
export async function fetchRoles() {
  const res = await fetch(apiUrl("/api/roles/public"), {
    method: "GET",
    headers: { Accept: "application/json" },
  })
  if (!res.ok) {
    throw await buildApiError(res)
  }
  const data = await res.json()
  return Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : []
}

/**
 * Registro previo al login (público: sin Bearer).
 * @param {{ email: string, contraseña: string }} body
 * @param {number} idRol — se envía dentro del body como `id_rol`
 */
export async function registrarUsuario(body, idRol) {
  const payload = {
    email: body.email,
    contraseña: body.contraseña,
    id_rol: Number(idRol),
  }
  const path = REGISTRO_PATH.startsWith("/") ? REGISTRO_PATH : `/${REGISTRO_PATH}`
  const res = await fetch(apiUrl(path), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    throw await buildApiError(res)
  }
  const ct = res.headers.get("content-type") ?? ""
  if (ct.includes("application/json")) {
    try {
      return await res.json()
    } catch {
      return null
    }
  }
  return null
}
