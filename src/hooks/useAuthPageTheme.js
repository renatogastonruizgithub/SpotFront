import { useCallback, useEffect, useState } from "react"

const STORAGE_KEY = "spot-auth-theme"

function readTheme() {
  if (typeof window === "undefined") return "dark"
  return window.localStorage.getItem(STORAGE_KEY) === "light" ? "light" : "dark"
}

/**
 * Tema de login/registro: "dark" | "light", persistido para mantener la preferencia al navegar.
 */
export function useAuthPageTheme() {
  const [theme, setThemeState] = useState(readTheme)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  useEffect(() => {
    function onStorage(e) {
      if (e.key === STORAGE_KEY && e.newValue != null) {
        setThemeState(e.newValue === "light" ? "light" : "dark")
      }
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeState((t) => (t === "dark" ? "light" : "dark"))
  }, [])

  return { theme, toggleTheme }
}
