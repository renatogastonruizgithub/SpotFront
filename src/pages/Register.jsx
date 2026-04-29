import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { registrarUsuario } from "@/services/usuariosService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff } from "lucide-react"

const fieldClass =
  "h-11 rounded-[10px] border border-[#22304f] bg-[#0b1730] text-sm text-white caret-white placeholder:text-[#51607f] shadow-none focus-visible:border-[#5a57ff] focus-visible:ring-2 focus-visible:ring-[#5a57ff]/25 dark:border-[#22304f] dark:bg-[#0b1730] dark:text-white dark:placeholder:text-[#51607f]"

function registrationMessageFromCode(code, fallback) {
  switch (code) {
    case "EMAIL_ALREADY_EXISTS":
      return "Ese correo ya está registrado. Probá iniciar sesión o recuperar acceso."
    case "ROLE_NOT_FOUND":
      return "El rol seleccionado no existe. Volvé a elegir cómo querés usar Spot."
    case "REGISTRATION_ROLE_NOT_ALLOWED":
      return "Ese rol no está habilitado para registro público."
    default:
      return fallback
  }
}

export default function Register() {
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
        setError(registrationMessageFromCode(err.code, err.message))
      } else {
        setError("No se pudo registrar")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#060d1f] text-white [color-scheme:dark]">
      <div className="grid min-h-[100dvh] grid-cols-1 lg:grid-cols-2">
        <section className="flex items-center justify-center px-4 py-8 sm:px-7 lg:px-10">
          <div className="w-full max-w-[390px]">
            <h1 className="text-4xl leading-tight font-semibold text-white">Crear cuenta</h1>
            <p className="mt-2 text-sm text-[#8a97b5]">
              Ingresá tus datos para registrarte en Spot.
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
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="space-y-2">
                <label htmlFor="reg-email" className="text-sm font-medium text-[#c8d2e9]">
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
                <label htmlFor="reg-pass" className="text-sm font-medium text-[#c8d2e9]">
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
                    className="absolute top-1/2 right-1.5 -translate-y-1/2 rounded-md p-1.5 text-[#a2afca] transition-colors hover:bg-[#162745] hover:text-white focus-visible:ring-2 focus-visible:ring-[#5a57ff]/40 focus-visible:outline-none"
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
                  className="text-sm font-medium text-[#c8d2e9]"
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
                    className="absolute top-1/2 right-1.5 -translate-y-1/2 rounded-md p-1.5 text-[#a2afca] transition-colors hover:bg-[#162745] hover:text-white focus-visible:ring-2 focus-visible:ring-[#5a57ff]/40 focus-visible:outline-none"
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
              {error ? (
                <p className="text-sm font-medium text-red-400" role="alert">
                  {error}
                </p>
              ) : null}
              <Button
                type="submit"
                disabled={loading}
                className="h-11 w-full rounded-[10px] bg-[#4e46ff] text-sm font-semibold text-white transition hover:bg-[#5e56ff]"
              >
                {loading ? "Creando cuenta..." : "Crear cuenta"}
              </Button>
              <p className="text-sm text-[#8a97b5]">
                ¿Ya tienes cuenta?{" "}
                <Link to="/login" className="font-semibold text-[#8fa2ff]">
                  Iniciar sesión
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
