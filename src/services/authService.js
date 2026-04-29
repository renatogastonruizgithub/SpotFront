import { apiUrl } from "@/lib/apiUrl"
import { buildApiError } from "@/lib/apiError"

const TOKEN_KEY = "spot_auth_token"
const EMAIL_KEY = "spot_auth_email"
const ONBOARDING_PREFIX = "onboardingChoice:"

/**
 * @param {string} email
 * @param {string} contraseña
 * @returns {Promise<{ token: string, mensaje?: string }>}
 */
export async function login(email, contraseña) {
  const res = await fetch(apiUrl("/Auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, contraseña }),
  })

  if (!res.ok) {
    throw await buildApiError(res)
  }

  const data = await res.json()
  const token = data.token ?? data.Token
  if (!token) {
    throw new Error("Respuesta sin token")
  }
  setToken(token)
  if (email) {
    try {
      localStorage.setItem(EMAIL_KEY, email)
    } catch {
      /* ignore */
    }
  }
  return { token, mensaje: data.mensaje ?? data.Mensaje }
}

/**
 * @param {string} email
 * @returns {Promise<string>}
 */
export async function reenviarActivacion(email) {
  const res = await fetch(apiUrl("/Auth/reenviar-activacion"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  })

  if (!res.ok) {
    throw await buildApiError(res)
  }

  const ct = res.headers.get("content-type") ?? ""
  if (ct.includes("application/json")) {
    try {
      const data = await res.json()
      return data.message ?? data.Message ?? data.mensaje ?? JSON.stringify(data)
    } catch {
      /* fall through */
    }
  }

  try {
    const text = (await res.text()).trim()
    return text || "Se reenvio el correo de activacion."
  } catch {
    return "Se reenvio el correo de activacion."
  }
}

/**
 * // Solicita correo de recuperación de contraseña para el email ingresado.
 * // Si el backend usa otra ruta, ajustar aquí sin tocar la UI.
 * @param {string} email
 * @returns {Promise<string>}
 */
export async function solicitarRecuperacionPassword(email) {
  // Algunas versiones del backend exponen esta ruta como /Auth/solicitar-recupero.
  const primaryPath =
    import.meta.env.VITE_AUTH_SOLICITAR_RECUPERO_PATH ?? "/Auth/solicitar-recupero"
  let res = await fetch(apiUrl(primaryPath), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  })

  // Fallback de compatibilidad para instalaciones con ruta antigua.
  if (res.status === 404 || res.status === 405) {
    res = await fetch(apiUrl("/Auth/solicitar-recuperacion-contrasena"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
  }

  if (!res.ok) {
    throw await buildApiError(res)
  }

  const ct = res.headers.get("content-type") ?? ""
  if (ct.includes("application/json")) {
    try {
      const data = await res.json()
      return data.message ?? data.Message ?? data.mensaje ?? "Revisá tu correo."
    } catch {
      return "Revisá tu correo."
    }
  }

  try {
    const text = (await res.text()).trim()
    return text || "Revisá tu correo."
  } catch {
    return "Revisá tu correo."
  }
}

export function logout() {
  try {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(EMAIL_KEY)
  } catch {
    /* ignore */
  }
}

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* ignore */
  }
}

export function getStoredEmail() {
  try {
    return localStorage.getItem(EMAIL_KEY)
  } catch {
    return null
  }
}

export function isAuthenticated() {
  return Boolean(getToken())
}

export function getUserIdFromToken() {
  const payload = getTokenPayload()
  if (!payload) return null

  const rawId =
    payload?.[
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
    ] ??
    payload?.nameid ??
    payload?.id_usuario ??
    payload?.idUsuario ??
    payload?.userId ??
    payload?.sub

  const parsed = Number(rawId)
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : null
}

export function getRoleFromToken() {
  const payload = getTokenPayload()
  if (!payload) return null

  const rawRole =
    payload?.[
      "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
    ] ??
    payload?.role ??
    payload?.rol ??
    payload?.rol_codigo ??
    payload?.tipo

  const normalized = String(rawRole ?? "").trim().toUpperCase()
  if (!normalized) return null
  if (normalized.includes("CLIENTE")) return "CLIENTE"
  if (normalized.includes("PROPIETARIO")) return "PROPIETARIO"
  if (normalized.includes("ADMIN")) return "ADMIN"
  return normalized
}

// Obtiene un identificador estable del usuario desde el token (id o email).
function getUserIdentityFromToken() {
  const payload = getTokenPayload()
  if (!payload) return null

  const userId =
    payload?.[
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
    ] ??
    payload?.nameid ??
    payload?.id_usuario ??
    payload?.idUsuario ??
    payload?.userId ??
    payload?.sub

  const parsedId = Number(userId)
  if (Number.isFinite(parsedId) && parsedId > 0) return `id:${Math.floor(parsedId)}`

  const rawEmail =
    payload?.email ??
    payload?.upn ??
    payload?.unique_name ??
    payload?.[
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
    ] ??
    getStoredEmail()

  const email = String(rawEmail ?? "").trim().toLowerCase()
  if (email) return `email:${email}`
  return null
}

// Clave por usuario para no mezclar onboarding entre cuentas distintas.
function getOnboardingStorageKey() {
  const identity = getUserIdentityFromToken()
  return identity ? `${ONBOARDING_PREFIX}${identity}` : null
}

// Lee elección previa de onboarding del usuario autenticado.
export function getOnboardingChoice() {
  const key = getOnboardingStorageKey()
  if (!key) return null
  try {
    const value = localStorage.getItem(key)
    if (!value) return null
    const normalized = String(value).trim().toLowerCase()
    return normalized === "cliente" || normalized === "propietario" ? normalized : null
  } catch {
    return null
  }
}

// Guarda elección de onboarding para el usuario autenticado actual.
export function setOnboardingChoice(choice) {
  const key = getOnboardingStorageKey()
  if (!key) return
  const normalized = String(choice ?? "").trim().toLowerCase()
  if (normalized !== "cliente" && normalized !== "propietario") return
  try {
    localStorage.setItem(key, normalized)
  } catch {
    /* ignore */
  }
}

// Resuelve ruta base por rol del token.
export function getHomeRouteByRole() {
  const role = getRoleFromToken()
  if (role === "PROPIETARIO") return "/owner/dashboard"
  if (role === "ADMIN") return "/admin"
  return "/"
}

function getTokenPayload() {
  const token = getToken()
  if (!token) return null

  try {
    const parts = token.split(".")
    if (parts.length < 2) return null
    return JSON.parse(decodeBase64Url(parts[1]))
  } catch {
    return null
  }
}

function decodeBase64Url(value) {
  const base64 = String(value).replace(/-/g, "+").replace(/_/g, "/")
  const padded = `${base64}${"=".repeat((4 - (base64.length % 4)) % 4)}`
  return atob(padded)
}

