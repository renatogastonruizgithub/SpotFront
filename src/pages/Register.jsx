import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { registrarUsuario } from "@/services/usuariosService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import AuthFloatingThemeToggle from "@/components/auth/AuthFloatingThemeToggle"
import { useAuthPageTheme } from "@/hooks/useAuthPageTheme"
import { Eye, EyeOff } from "lucide-react"

function registrationMessageFromCode(code, status, fallback) {
  if (status === 409) {
    return "Ese correo ya está registrado. Probá iniciar sesión o recuperar acceso."
  }
  if (status === 405) {
    return "El endpoint de registro no acepta este método. Revisemos la ruta/método con backend."
  }
  if (status >= 500) {
    return "Error interno del servidor al crear la cuenta. Intentá nuevamente en unos minutos."
  }

  switch (code) {
    case "EMAIL_ALREADY_EXISTS":
      return "Ese correo ya está registrado. Probá iniciar sesión o recuperar acceso."
    default:
      return fallback
  }
}

export default function Register() {
  const { theme, toggleTheme } = useAuthPageTheme()
  const isDark = theme === "dark"
  const fieldClass = isDark
    ? "h-11 rounded-[10px] border border-[#22304f] bg-[#0b1730] text-sm text-white caret-white placeholder:text-[#51607f] shadow-none focus-visible:border-[#5a57ff] focus-visible:ring-2 focus-visible:ring-[#5a57ff]/25"
    : "h-11 rounded-[10px] border border-slate-200 bg-white text-sm text-slate-900 caret-slate-900 placeholder:text-slate-400 shadow-none focus-visible:border-[#5a57ff] focus-visible:ring-2 focus-visible:ring-[#5a57ff]/25"

  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [contraseña, setContraseña] = useState("")
  const [confirmarContraseña, setConfirmarContraseña] = useState("")
  const [mostrarContraseña, setMostrarContraseña] = useState(false)
  const [mostrarRepetir, setMostrarRepetir] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")

    if (contraseña.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.")
      return
    }
    if (contraseña !== confirmarContraseña) {
      setError("Las contraseñas no coinciden. Revisá y volvé a intentar.")
      return
    }

    setLoading(true)
    try {
      // El backend envía el mail de activación al crear la cuenta.
      await registrarUsuario({ email: email.trim(), contraseña })
      navigate("/login", {
        replace: false,
        state: {
          registered: true,
        },
      })
    } catch (err) {
      if (err instanceof Error) {
        setError(registrationMessageFromCode(err.code, Number(err.status ?? 0), err.message))
      } else {
        setError("No se pudo registrar")
      }
    } finally {
      setLoading(false)
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
              Crear cuenta
            </h1>
            <p className={`mt-2 text-sm ${isDark ? "text-[#8a97b5]" : "text-slate-500"}`}>
              Ingresá tus datos para registrarte en Spot.
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
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="w-full space-y-4 text-left">
                <div className="space-y-2">
                  <label
                    htmlFor="reg-email"
                    className={`text-sm font-medium ${isDark ? "text-[#c8d2e9]" : "text-slate-700"}`}
                  >
                    Correo electrónico
                  </label>
                  <Input
                    id="reg-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="dueno@bar.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={fieldClass}
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="reg-pass"
                    className={`text-sm font-medium ${isDark ? "text-[#c8d2e9]" : "text-slate-700"}`}
                  >
                    Contraseña
                  </label>
                  <div className="relative">
                    <Input
                      id="reg-pass"
                      name="contraseña"
                      type={mostrarContraseña ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Ingresa tu contraseña"
                      value={contraseña}
                      onChange={(e) => setContraseña(e.target.value)}
                      required
                      minLength={6}
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
                      aria-label={
                        mostrarContraseña ? "Ocultar contraseña" : "Mostrar contraseña"
                      }
                    >
                      {mostrarContraseña ? (
                        <EyeOff className="size-4" aria-hidden />
                      ) : (
                        <Eye className="size-4" aria-hidden />
                      )}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="reg-pass-repeat"
                    className={`text-sm font-medium ${isDark ? "text-[#c8d2e9]" : "text-slate-700"}`}
                  >
                    Confirmar contraseña
                  </label>
                  <div className="relative">
                    <Input
                      id="reg-pass-repeat"
                      name="confirmarContraseña"
                      type={mostrarRepetir ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Confirma tu contraseña"
                      value={confirmarContraseña}
                      onChange={(e) => setConfirmarContraseña(e.target.value)}
                      required
                      minLength={6}
                      className={`${fieldClass} pr-11`}
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarRepetir((v) => !v)}
                      className={
                        isDark
                          ? "absolute top-1/2 right-1.5 -translate-y-1/2 rounded-md p-1.5 text-[#a2afca] transition-colors hover:bg-[#162745] hover:text-white focus-visible:ring-2 focus-visible:ring-[#5a57ff]/40 focus-visible:outline-none"
                          : "absolute top-1/2 right-1.5 -translate-y-1/2 rounded-md p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-[#5a57ff]/40 focus-visible:outline-none"
                      }
                      aria-label={
                        mostrarRepetir ? "Ocultar repetición" : "Mostrar repetición"
                      }
                    >
                      {mostrarRepetir ? (
                        <EyeOff className="size-4" aria-hidden />
                      ) : (
                        <Eye className="size-4" aria-hidden />
                      )}
                    </button>
                  </div>
                </div>
              </div>
              {error ? (
                <p className="text-left text-sm font-medium text-red-400" role="alert">
                  {error}
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
                {loading ? "Creando cuenta..." : "Crear cuenta"}
              </Button>
              <p className={`text-sm ${isDark ? "text-[#8a97b5]" : "text-slate-500"}`}>
                ¿Ya tienes cuenta?{" "}
                <Link
                  to="/login"
                  className={`font-semibold ${isDark ? "text-white" : "text-black"}`}
                >
                  Iniciar sesión
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
