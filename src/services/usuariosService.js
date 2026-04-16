import { apiUrl } from "@/lib/apiUrl"

/**
 * POST attribute routing en el API: `Auth/registrarUsuarios`
 * Body: { email, contraseña, id_rol }. Respuesta 201.
 * Sobrescribir con `VITE_API_REGISTRO_PATH` si cambia el contrato.
 */
const REGISTRO_PATH =
  String(import.meta.env.VITE_API_REGISTRO_PATH ?? "").trim() ||
  "/Auth/registrarUsuarios"

/** Listado de roles (público en dev; si el API exige JWT, iniciá sesión antes). */
export async function fetchRoles() {
  const res = await fetch(apiUrl("/api/roles"), {
    method: "GET",
    headers: { Accept: "application/json" },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text.trim() || `Error ${res.status}`)
  }
  return res.json()
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
    const text = await res.text()
    let msg = text.trim()
    try {
      const j = JSON.parse(text)
      msg = j.Message ?? j.message ?? j.mensaje ?? msg
    } catch {
      /* texto plano */
    }
    throw new Error(msg || `Error ${res.status}`)
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
