import { apiUrl } from "@/lib/apiUrl"

/**
 * POST attribute routing en el API: `api/usuarios/registrarUsuarios?id_rol=...`
 * Body: { email, contraseña }. Respuesta 201 { mensaje }.
 * Sobrescribir con `VITE_API_REGISTRO_PATH` si cambia el contrato.
 */
const REGISTRO_PATH =
  String(import.meta.env.VITE_API_REGISTRO_PATH ?? "").trim() ||
  "/api/usuarios/registrarUsuarios"

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
 * El rol va solo en la query (`?id_rol=`), no en el JSON del usuario.
 * @param {{ email: string, contraseña: string }} body — solo email y contraseña
 * @param {number} idRol — se envía en la URL, no en el body
 */
export async function registrarUsuario(body, idRol) {
  const payload = {
    email: body.email,
    contraseña: body.contraseña,
  }
  const q = new URLSearchParams({ id_rol: String(idRol) })
  const path = REGISTRO_PATH.startsWith("/") ? REGISTRO_PATH : `/${REGISTRO_PATH}`
  const res = await fetch(`${apiUrl(path)}?${q.toString()}`, {
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
