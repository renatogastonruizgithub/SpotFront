import { createContext, useCallback, useContext, useMemo } from "react"
import { apiUrl } from "@/lib/apiUrl"
import { getToken } from "@/services/authService"

const ApiContext = createContext(null)

async function parseErrorMessage(response) {
  const ct = response.headers.get("content-type") ?? ""
  if (ct.includes("application/json")) {
    try {
      const j = await response.json()
      return (
        j.message ??
        j.Message ??
        j.mensaje ??
        j.error ??
        (typeof j === "string" ? j : JSON.stringify(j))
      )
    } catch {
      /* fall through */
    }
  }
  try {
    const t = (await response.text()).trim()
    return t || `${response.status}: ${response.statusText}`
  } catch {
    return `${response.status}: ${response.statusText}`
  }
}

export function ApiProvider({ children }) {
  const request = useCallback(async (path, options = {}) => {
    const {
      treat404AsEmpty = false,
      auth = true,
      skipJsonBody = false,
      ...fetchOptions
    } = options

    const url =
      path.startsWith("http://") || path.startsWith("https://")
        ? path
        : apiUrl(path.startsWith("/") ? path : `/${path}`)

    const headers = {
      ...fetchOptions.headers,
    }

    if (
      auth &&
      getToken() &&
      !headers.Authorization &&
      !headers.authorization
    ) {
      headers.Authorization = `Bearer ${getToken()}`
    }

    const hasBody = fetchOptions.body != null
    if (
      hasBody &&
      typeof fetchOptions.body === "string" &&
      !headers["Content-Type"] &&
      !headers["content-type"]
    ) {
      headers["Content-Type"] = "application/json"
    }

    const config = {
      ...fetchOptions,
      headers,
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        if (treat404AsEmpty && response.status === 404) {
          return []
        }
        const errText = await parseErrorMessage(response)
        throw new Error(errText || `Error ${response.status}`)
      }

      if (response.status === 204 || skipJsonBody) {
        return null
      }

      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("application/json")) {
        return await response.json()
      }
      const text = await response.text()
      return text || null
    } catch (error) {
      console.error("API Request Error:", error)
      throw error
    }
  }, [])

  const api = useMemo(() => {
    return {
      request,
      get: (path, options) => request(path, { ...options, method: "GET" }),
      post: (path, body, options) =>
        request(path, {
          ...options,
          method: "POST",
          body: body != null ? JSON.stringify(body) : undefined,
        }),
      put: (path, body, options) =>
        request(path, {
          ...options,
          method: "PUT",
          body: body != null ? JSON.stringify(body) : undefined,
        }),
      patch: (path, body, options) =>
        request(path, {
          ...options,
          method: "PATCH",
          body: body != null ? JSON.stringify(body) : undefined,
        }),
      delete: (path, options) =>
        request(path, { ...options, method: "DELETE" }),
    }
  }, [request])

  return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components -- hook ligado a ApiProvider
export function useApi() {
  const context = useContext(ApiContext)
  if (!context) {
    throw new Error("useApi debe ser usado dentro de un ApiProvider")
  }
  return context
}
