import { apiUrl } from "@/lib/apiUrl"

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
    const msg = await readErrorBody(res)
    throw new Error(msg || `Error ${res.status}`)
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

async function readErrorBody(res) {
  const ct = res.headers.get("content-type") ?? ""
  if (ct.includes("application/json")) {
    try {
      const j = await res.json()
      return j.message ?? j.Message ?? j.mensaje ?? j.error ?? JSON.stringify(j)
    } catch {
      /* fall through */
    }
  }
  try {
    return (await res.text()).trim() || null
  } catch {
    return res.statusText
  }
}
