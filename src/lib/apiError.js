/**
 * Construye un Error enriquecido a partir de una respuesta HTTP.
 * Soporta contrato backend: { code, message, details }.
 */
export async function buildApiError(response) {
  const error = new Error(`Error ${response.status}`)
  error.status = response.status
  error.code = undefined
  error.details = undefined

  const ct = response.headers.get("content-type") ?? ""
  if (ct.includes("application/json")) {
    try {
      const data = await response.json()
      error.code = data?.code
      error.details = data?.details
      error.message =
        data?.message ??
        data?.Message ??
        data?.mensaje ??
        data?.error ??
        error.message
      return error
    } catch {
      /* fall through */
    }
  }

  try {
    const text = (await response.text()).trim()
    if (text) error.message = text
  } catch {
    if (response.statusText) error.message = response.statusText
  }

  return error
}
