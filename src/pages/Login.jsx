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
import { Eye, EyeOff } from "lucide-react"

const fieldClass =
  "h-11 rounded-[10px] border border-[#22304f] bg-[#0b1730] text-sm text-white caret-white shadow-none focus-visible:border-[#5a57ff] focus-visible:ring-2 focus-visible:ring-[#5a57ff]/25 dark:border-[#22304f] dark:bg-[#0b1730] dark:text-white"

export default function Login() {
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
    <div className="min-h-[100dvh] bg-[#060d1f] text-white [color-scheme:dark]">
      <div className="grid min-h-[100dvh] grid-cols-1 lg:grid-cols-2">
        <section className="flex items-center justify-center px-4 py-8 sm:px-7 lg:px-10">
          <div className="w-full max-w-[390px]">
            <h1 className="text-4xl leading-tight font-semibold text-white">Iniciar sesión</h1>
            <p className="mt-2 text-sm text-[#8a97b5]">
              Ingresá tu correo y contraseña para entrar a Spot Admin.
            </p>
            <button
              type="button"
              className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-[10px] border border-[#22304f] bg-[#0b1730] text-sm font-semibold text-white transition hover:border-[#3a4a72]"
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
              <span className="h-px flex-1 bg-[#22304f]" />
              <span className="text-xs text-[#6c7895]">O</span>
              <span className="h-px flex-1 bg-[#22304f]" />
            </div>
            {registeredHint ? (
              <p className="mb-3 rounded-lg border border-[#244c88] bg-[#112447] px-3 py-2 text-sm text-[#bfdcff]">
                Registro exitoso. Revisá tu correo para confirmar la cuenta antes de
                entrar.
              </p>
            ) : null}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-[#c8d2e9]">
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
              <div className="space-y-2">
                <label htmlFor="contraseña" className="text-sm font-medium text-[#c8d2e9]">
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
                    className="absolute top-1/2 right-1.5 -translate-y-1/2 rounded-md p-1.5 text-[#a2afca] transition-colors hover:bg-[#162745] hover:text-white focus-visible:ring-2 focus-visible:ring-[#5a57ff]/40 focus-visible:outline-none"
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
                    className="text-sm font-medium text-[#7987aa] transition hover:text-[#cfd9ef]"
                  >
                    ¿Olvidaste tu contraseña? Restablecer
                  </Link>
                </p>
              </div>
              {error ? (
                <p className="text-sm font-medium text-red-400" role="alert">
                  {error}
                </p>
              ) : null}
              {mostrarReenvio ? (
                <div className="rounded-lg border border-[#4f6ba5] bg-[#13213f] p-3">
                  <p className="text-sm text-[#d5e5ff]">
                    Tu cuenta todavía no está activada. Reenviá el correo de activación.
                  </p>
                  <button
                    type="button"
                    onClick={handleReenviarActivacion}
                    disabled={reenviando}
                    className="mt-2 w-fit text-sm font-medium text-[#91a8de] underline-offset-2 enabled:hover:underline disabled:cursor-not-allowed disabled:text-[#5d6780]"
                  >
                    {reenviando ? "Enviando..." : "Reenviar correo de activación"}
                  </button>
                </div>
              ) : null}
              {mensajeReenvio ? (
                <p className="text-sm font-medium text-emerald-400" role="status">
                  {mensajeReenvio}
                </p>
              ) : null}
              {errorReenvio ? (
                <p className="text-sm font-medium text-red-400" role="alert">
                  {errorReenvio}
                </p>
              ) : null}
              <Button
                type="submit"
                disabled={loading}
                className="h-11 w-full rounded-[10px] bg-[#4e46ff] text-sm font-semibold text-white transition hover:bg-[#5e56ff]"
              >
                {loading ? "Ingresando..." : "Ingresar"}
              </Button>
              <p className="text-sm text-[#8a97b5]">
                No tenes cuenta?{" "}
                <Link to="/register" className="font-semibold text-[#8fa2ff]">
                  Crear cuenta
                </Link>
              </p>
            </form>
          </div>
        </section>
        <section className="relative hidden overflow-hidden bg-[#0a1630] lg:flex lg:items-center lg:justify-center">
          <div
            className="absolute inset-0 opacity-35"
            style={{
              backgroundImage:
                "linear-gradient(rgba(121,153,219,0.28) 1px, transparent 1px), linear-gradient(90deg, rgba(121,153,219,0.28) 1px, transparent 1px)",
              backgroundSize: "56px 56px",
            }}
          />
          <div className="relative px-8 text-center">
            <h2 className="text-6xl font-semibold tracking-tight text-white">Spot</h2>
            <p className="mx-auto mt-3 max-w-[380px] text-2xl leading-relaxed text-[#d6dff2]">
              App para descubrir bares, promociones y experiencias cerca tuyo.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
