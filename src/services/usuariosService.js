import { apiUrl } from "@/lib/apiUrl"

/**
 * Ruta POST de registro. En Web API 2 con ruta `api/{controller}/{id}` (sin `{action}`),
 * un segmento extra tipo `.../registrarUsuarios` no es una acción: suele usarse
 * `POST /api/usuarios?id_rol=...` y el método `Post` del controlador.
 * Si tu API define `[Route("registrarUsuarios")]` u otra, configurá `VITE_API_REGISTRO_PATH`.
 */
const REGISTRO_PATH =
  String(import.meta.env.VITE_API_REGISTRO_PATH ?? "").trim() ||
  "/api/usuarios"

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
    throw new Error(text.trim() || `Error ${res.status}`)
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
