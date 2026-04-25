import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import {
  getHomeRouteByRole,
  getOnboardingChoice,
  login,
  reenviarActivacion,
} from "@/services/authService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Eye, EyeOff } from "lucide-react"

/** Modo claro forzado: texto oscuro = puntos de contraseña y cursor visibles (también si hay .dark en el árbol). */
const fieldClass =
  "border-slate-300 bg-white text-slate-900 caret-slate-900 placeholder:text-slate-400 shadow-sm focus-visible:border-sky-500 focus-visible:ring-sky-500/30 dark:border-slate-300 dark:bg-white dark:text-slate-900 dark:placeholder:text-slate-400"

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

      // 2) Si no tiene onboarding elegido, va a seleccionar uso.
      const onboardingChoice = getOnboardingChoice()
      if (!onboardingChoice) {
        navigate("/seleccionar-uso", { replace: true })
        return
      }

      // 3) Si ya eligió, va directo al home según rol.
      const roleHome = getHomeRouteByRole()
      const targetPath =
        from && from !== "/login" && from !== "/seleccionar-uso" ? from : roleHome
      navigate(targetPath, { replace: true })
    } catch (err) {
      // Mostramos exactamente el mensaje backend en 400 (sin texto genérico).
      const msg = err instanceof Error ? err.message : "No se pudo iniciar sesión"
      setError(msg)
      const code = err instanceof Error ? String(err.code ?? "") : ""
      const lowerMsg = msg.toLowerCase()
      if (
        code.toUpperCase().includes("ACTIV") ||
        lowerMsg.includes("activar") ||
        lowerMsg.includes("activada")
      ) {
        setMostrarReenvio(true)
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleReenviarActivacion() {
    if (!emailValido || reenviando) return

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
      className="flex min-h-[100dvh] items-center justify-center bg-gradient-to-b from-slate-100 to-slate-200 p-4 [color-scheme:light]"
    >
      <Card className="w-full max-w-md border border-slate-200 bg-white text-slate-900 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl text-cyan-700">
            Iniciar sesión
          </CardTitle>
          <CardDescription className="text-slate-600">
            Ingresá el mismo correo y contraseña con los que te registraste.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {registeredHint ? (
            <p className="mb-3 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-900">
              Registro exitoso. Revisá tu correo para confirmar la cuenta antes de
              entrar.
            </p>
          ) : null}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-800">
                Correo electrónico
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => manejarCambioEmail(e.target.value)}
                required
                className={fieldClass}
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="contraseña"
                className="text-sm font-medium text-slate-800"
              >
                Contraseña
              </label>
              <div className="relative">
                <Input
                  id="contraseña"
                  name="contraseña"
                  type={mostrarContraseña ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={contraseña}
                  onChange={(e) => setContraseña(e.target.value)}
                  required
                  className={`${fieldClass} pr-11`}
                  aria-describedby="hint-contraseña"
                />
                <button
                  type="button"
                  onClick={() => setMostrarContraseña((v) => !v)}
                  className="absolute top-1/2 right-1.5 -translate-y-1/2 rounded-md p-1.5 text-slate-600 transition-colors hover:bg-slate-100 hover:text-cyan-700 focus-visible:ring-2 focus-visible:ring-cyan-500/50 focus-visible:outline-none"
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
              <p id="hint-contraseña" className="text-xs text-slate-600">
                {mostrarContraseña
                  ? "Podés ver lo que escribís. Tocá el ícono para ocultarla."
                  : "Los puntos indican cada letra. Tocá el ojo si querés ver la contraseña."}
              </p>
              {/* Acción rápida para recuperar contraseña si no recuerda el acceso. */}
              <p className="pt-1">
                <Link
                  to="/recuperar-contraseña"
                  state={{ email }}
                  className="text-sm font-medium text-cyan-700 underline-offset-2 hover:underline"
                >
                  ¿Olvidaste tu contraseña? Restablecer
                </Link>
              </p>
            </div>
            {error ? (
              <p className="text-sm font-medium text-red-600" role="alert">
                {error}
              </p>
            ) : null}
            {mostrarReenvio ? (
              <button
                type="button"
                onClick={handleReenviarActivacion}
                disabled={!emailValido || reenviando}
                className="w-fit text-sm font-medium text-cyan-700 underline-offset-2 enabled:hover:underline disabled:cursor-not-allowed disabled:text-slate-400"
              >
                {reenviando ? "Enviando..." : "Reenviar correo de activación"}
              </button>
            ) : null}
            {mensajeReenvio ? (
              <p className="text-sm font-medium text-emerald-700" role="status">
                {mensajeReenvio}
              </p>
            ) : null}
            {errorReenvio ? (
              <p className="text-sm font-medium text-red-600" role="alert">
                {errorReenvio}
              </p>
            ) : null}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-600 text-white hover:bg-cyan-700"
            >
              {loading ? "Entrando…" : "Entrar"}
            </Button>
            <p className="text-center text-sm text-slate-600">
              ¿No tenés cuenta?{" "}
              <Link
                to="/seleccionar-uso"
                className="font-medium text-cyan-700 underline-offset-2 hover:underline"
              >
                Registrate
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
