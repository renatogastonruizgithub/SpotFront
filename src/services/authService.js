import { apiUrl } from "@/lib/apiUrl"
import { buildApiError } from "@/lib/apiError"

const TOKEN_KEY = "spot_auth_token"
const EMAIL_KEY = "spot_auth_email"

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
  const token = getToken()
  if (!token) return null

  try {
    const parts = token.split(".")
    if (parts.length < 2) return null
    const payload = JSON.parse(decodeBase64Url(parts[1]))

    const rawId =
      payload?.nameid ??
      payload?.[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
      ] ??
      payload?.sub

    const parsed = Number(rawId)
    return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : null
  } catch {
    return null
  }
}

function decodeBase64Url(value) {
  const base64 = String(value).replace(/-/g, "+").replace(/_/g, "/")
  const padded = `${base64}${"=".repeat((4 - (base64.length % 4)) % 4)}`
  return atob(padded)
}

