import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import {
  getHomeRouteByRole,
  login,
  needsRoleAssignment,
  reenviarActivacion,
} from "@/services/authService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import AuthFloatingThemeToggle from "@/components/auth/AuthFloatingThemeToggle"
import { useAuthPageTheme } from "@/hooks/useAuthPageTheme"
import { Eye, EyeOff } from "lucide-react"

export default function Login() {
  const { theme, toggleTheme } = useAuthPageTheme()
  const isDark = theme === "dark"
  const fieldClass = isDark
    ? "h-11 rounded-[10px] border border-[#22304f] bg-[#0b1730] text-sm text-white caret-white shadow-none focus-visible:border-[#5a57ff] focus-visible:ring-2 focus-visible:ring-[#5a57ff]/25"
    : "h-11 rounded-[10px] border border-slate-200 bg-white text-sm text-slate-900 caret-slate-900 shadow-none placeholder:text-slate-400 focus-visible:border-[#5a57ff] focus-visible:ring-2 focus-visible:ring-[#5a57ff]/25"

  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || "/"
  const registeredHint = Boolean(location.state?.registered)

  const [email, setEmail] = useState("")
  const [contraseña, setContraseña] = useState("")
  const [mostrarContraseña, setMostrarContraseña] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [mostrarReenvio, setMostrarReenvio] = useState(registeredHint)
  const [reenviando, setReenviando] = useState(false)
  const [mensajeReenvio, setMensajeReenvio] = useState("")
  const [errorReenvio, setErrorReenvio] = useState("")

  const emailNormalizado = email.trim()
  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalizado)

  // Detecta específicamente el caso de cuenta no activada devuelto por /Auth/login.
  function requiereActivacion(status, mensaje) {
    const texto = String(mensaje ?? "").toLowerCase()
    return status === 400 && texto.includes("activar tu cuenta")
  }

  function loginMessageFromStatus(status, fallback) {
    if (status === 405) {
      return "El endpoint de login no acepta GET. Debe llamarse por POST desde el frontend."
    }
    if (status >= 500) {
      return "Error interno del servidor al iniciar sesión. Intentá nuevamente en unos minutos."
    }
    return fallback
  }

  function manejarCambioEmail(value) {
    setEmail(value)
    setMensajeReenvio("")
    setErrorReenvio("")
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")
    setMensajeReenvio("")
    setErrorReenvio("")
    setLoading(true)
    try {
      // 1) Autentica únicamente con POST /Auth/login.
      await login(email.trim(), contraseña)

      // 2) Rol `user`: debe elegir explorador o propietario (PATCH /Auth/asignar-rol).
      if (needsRoleAssignment()) {
        navigate("/seleccionar-uso", { replace: true })
        return
      }

      // 3) Si ya tiene rol en el JWT, va al home según rol (y deep link si aplica).
      const roleHome = getHomeRouteByRole()
      const targetPath =
        from && from !== "/login" && from !== "/seleccionar-uso" ? from : roleHome
      navigate(targetPath, { replace: true })
    } catch (err) {
      // Mostramos exactamente el mensaje backend en 400 (sin texto genérico).
      const msg = err instanceof Error ? err.message : "No se pudo iniciar sesión"
      const status = err instanceof Error ? Number(err.status ?? 0) : 0
      setError(loginMessageFromStatus(status, msg))
      if (requiereActivacion(status, msg)) {
        setMostrarReenvio(true)
      } else {
        setMostrarReenvio(false)
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleReenviarActivacion() {
    if (reenviando) return

    // Validación UX: no llamamos API si el email está vacío o inválido.
    if (!emailNormalizado) {
      setErrorReenvio("Ingresá tu correo electrónico para reenviar la activación.")
      return
    }
    if (!emailValido) {
      setErrorReenvio("Ingresá un correo válido para reenviar la activación.")
      return
    }

    setMensajeReenvio("")
    setErrorReenvio("")
    setReenviando(true)

    try {
      const mensaje = await reenviarActivacion(emailNormalizado)
      setMensajeReenvio(mensaje)
    } catch (err) {
      setErrorReenvio(
        err instanceof Error ? err.message : "No se pudo reenviar el correo de activación",
      )
    } finally {
      setReenviando(false)
    }
  }

  return (
    <div
      className={
        isDark
          ? "min-h-[100dvh] bg-[#060d1f] text-white [color-scheme:dark]"
          : "min-h-[100dvh] bg-[#f4f6fc] text-slate-900 [color-scheme:light]"
      }
    >
      <div className="grid min-h-[100dvh] grid-cols-1 lg:grid-cols-2">
        <section className="flex min-h-[100dvh] flex-col justify-center overflow-y-auto px-4 py-6 sm:px-7 lg:min-h-[100dvh] lg:justify-center lg:overflow-y-visible lg:px-10">
          <div className="mx-auto w-full max-w-[390px] text-center lg:text-left">
            <h1
              className={
                isDark
                  ? "text-4xl leading-tight font-semibold text-white"
                  : "text-4xl leading-tight font-semibold text-black"
              }
            >
              Iniciar sesión
            </h1>
            <p className={`mt-2 text-sm ${isDark ? "text-[#8a97b5]" : "text-slate-500"}`}>
              Ingresá tu correo y contraseña para entrar a Spot Admin.
            </p>
            <button
              type="button"
              className={
                isDark
                  ? "mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-[10px] border border-[#22304f] bg-[#0b1730] text-sm font-semibold text-white transition hover:border-[#3a4a72]"
                  : "mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-[10px] border border-slate-200 bg-white text-sm font-semibold text-slate-900 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
              }
            >
              <span
                aria-hidden
                className="inline-flex size-5 items-center justify-center rounded-full bg-white text-xs font-bold text-[#1a4fd7]"
              >
                G
              </span>
              Iniciar con Google
            </button>
            <div className="my-5 flex items-center gap-3">
              <span className={`h-px flex-1 ${isDark ? "bg-[#22304f]" : "bg-slate-200"}`} />
              <span className={`text-xs ${isDark ? "text-[#6c7895]" : "text-slate-400"}`}>O</span>
              <span className={`h-px flex-1 ${isDark ? "bg-[#22304f]" : "bg-slate-200"}`} />
            </div>
            {registeredHint ? (
              <p
                className={
                  isDark
                    ? "mb-3 rounded-lg border border-[#244c88] bg-[#112447] px-3 py-2 text-left text-sm text-[#bfdcff]"
                    : "mb-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-left text-sm text-blue-950"
                }
              >
                Registro exitoso. Revisá tu correo para confirmar la cuenta antes de
                entrar.
              </p>
            ) : null}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="w-full text-left">
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className={`text-sm font-medium ${isDark ? "text-[#c8d2e9]" : "text-slate-700"}`}
                  >
                    Correo electrónico
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => manejarCambioEmail(e.target.value)}
                    required
                    className={fieldClass}
                  />
                </div>
                <div className="mt-4 space-y-2">
                  <label
                    htmlFor="contraseña"
                    className={`text-sm font-medium ${isDark ? "text-[#c8d2e9]" : "text-slate-700"}`}
                  >
                    Contraseña
                  </label>
                  <div className="relative">
                    <Input
                      id="contraseña"
                      name="contraseña"
                      type={mostrarContraseña ? "text" : "password"}
                      autoComplete="current-password"
                      value={contraseña}
                      onChange={(e) => setContraseña(e.target.value)}
                      required
                      className={`${fieldClass} pr-11`}
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarContraseña((v) => !v)}
                      className={
                        isDark
                          ? "absolute top-1/2 right-1.5 -translate-y-1/2 rounded-md p-1.5 text-[#a2afca] transition-colors hover:bg-[#162745] hover:text-white focus-visible:ring-2 focus-visible:ring-[#5a57ff]/40 focus-visible:outline-none"
                          : "absolute top-1/2 right-1.5 -translate-y-1/2 rounded-md p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-[#5a57ff]/40 focus-visible:outline-none"
                      }
                      aria-pressed={mostrarContraseña}
                      aria-label={
                        mostrarContraseña
                          ? "Ocultar contraseña"
                          : "Mostrar contraseña mientras escribís"
                      }
                    >
                      {mostrarContraseña ? (
                        <EyeOff className="size-4" aria-hidden />
                      ) : (
                        <Eye className="size-4" aria-hidden />
                      )}
                    </button>
                  </div>
                  <p className="pt-1">
                    <Link
                      to="/recuperar-contraseña"
                      state={{ email }}
                      className={
                        isDark
                          ? "text-sm font-medium text-[#7987aa] transition hover:text-[#cfd9ef]"
                          : "text-sm font-medium text-slate-600 transition hover:text-slate-900"
                      }
                    >
                      ¿Olvidaste tu contraseña? Restablecer
                    </Link>
                  </p>
                </div>
              </div>
              {error ? (
                <p className="text-left text-sm font-medium text-red-400" role="alert">
                  {error}
                </p>
              ) : null}
              {mostrarReenvio ? (
                <div
                  className={
                    isDark
                      ? "rounded-lg border border-[#4f6ba5] bg-[#13213f] p-3 text-left"
                      : "rounded-lg border border-blue-200 bg-blue-50/90 p-3 text-left"
                  }
                >
                  <p className={`text-sm ${isDark ? "text-[#d5e5ff]" : "text-slate-800"}`}>
                    Tu cuenta todavía no está activada. Reenviá el correo de activación.
                  </p>
                  <button
                    type="button"
                    onClick={handleReenviarActivacion}
                    disabled={reenviando}
                    className={
                      isDark
                        ? "mt-2 w-fit text-sm font-medium text-[#91a8de] underline-offset-2 enabled:hover:underline disabled:cursor-not-allowed disabled:text-[#5d6780]"
                        : "mt-2 w-fit text-sm font-medium text-[#4e46ff] underline-offset-2 enabled:hover:underline disabled:cursor-not-allowed disabled:text-slate-400"
                    }
                  >
                    {reenviando ? "Enviando..." : "Reenviar correo de activación"}
                  </button>
                </div>
              ) : null}
              {mensajeReenvio ? (
                <p className="text-left text-sm font-medium text-emerald-400" role="status">
                  {mensajeReenvio}
                </p>
              ) : null}
              {errorReenvio ? (
                <p className="text-left text-sm font-medium text-red-400" role="alert">
                  {errorReenvio}
                </p>
              ) : null}
              <Button
                type="submit"
                disabled={loading}
                className={
                  isDark
                    ? "h-11 w-full rounded-[10px] border border-[#3a5a9d] bg-[#121f3d] text-sm font-semibold text-white shadow-[0_4px_16px_rgba(0,0,0,0.45)] transition hover:border-[#4d6eb8] hover:bg-[#1a2d55] focus-visible:ring-2 focus-visible:ring-[#5a7fd0]/50 disabled:cursor-not-allowed disabled:opacity-50"
                    : "h-11 w-full rounded-[10px] border border-black bg-black text-sm font-semibold text-white transition hover:bg-neutral-900 focus-visible:ring-2 focus-visible:ring-black/30 disabled:cursor-not-allowed disabled:opacity-50"
                }
              >
                {loading ? "Ingresando..." : "Ingresar"}
              </Button>
              <p className={`text-sm ${isDark ? "text-[#8a97b5]" : "text-slate-500"}`}>
                No tenes cuenta?{" "}
                <Link
                  to="/register"
                  className={`font-semibold ${isDark ? "text-white" : "text-black"}`}
                >
                  Crear cuenta
                </Link>
              </p>
            </form>
          </div>
        </section>
        <section
          className={
            isDark
              ? "relative hidden overflow-hidden bg-[#0a1630] lg:flex lg:items-center lg:justify-center"
              : "relative hidden overflow-hidden bg-[#dce7f7] lg:flex lg:items-center lg:justify-center"
          }
        >
          <div
            className="absolute inset-0 opacity-35"
            style={{
              backgroundImage: isDark
                ? "linear-gradient(rgba(121,153,219,0.28) 1px, transparent 1px), linear-gradient(90deg, rgba(121,153,219,0.28) 1px, transparent 1px)"
                : "linear-gradient(rgba(71,85,105,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(71,85,105,0.2) 1px, transparent 1px)",
              backgroundSize: "56px 56px",
            }}
          />
          <div className="relative px-8 text-center">
            <h2
              className={
                isDark
                  ? "text-6xl font-semibold tracking-tight text-white"
                  : "text-6xl font-semibold tracking-tight text-slate-900"
              }
            >
              Spot
            </h2>
            <p
              className={
                isDark
                  ? "mx-auto mt-3 max-w-[380px] text-2xl leading-relaxed text-[#d6dff2]"
                  : "mx-auto mt-3 max-w-[380px] text-2xl leading-relaxed text-slate-600"
              }
            >
              App para descubrir bares, promociones y experiencias cerca tuyo.
            </p>
          </div>
        </section>
      </div>
      <AuthFloatingThemeToggle isDark={isDark} onToggle={toggleTheme} />
    </div>
  )
}
