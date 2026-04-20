import { useState } from "react"
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom"
import { registrarUsuario } from "@/services/usuariosService"
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

const fieldClass =
  "border-slate-300 bg-white text-slate-900 caret-slate-900 placeholder:text-slate-400 shadow-sm focus-visible:border-sky-500 focus-visible:ring-sky-500/30 dark:border-slate-300 dark:bg-white dark:text-slate-900 dark:placeholder:text-slate-400"

function idRolDesdeEnv() {
  const n = Number(import.meta.env.VITE_REGISTRO_ID_ROL)
  const normalized = Number.isFinite(n) && n > 0 ? Math.floor(n) : 2
  return normalized === 2 || normalized === 3 ? normalized : 2
}

function parseRoleId(value) {
  const n = Number(value)
  if (!Number.isFinite(n) || n <= 0) return null
  const normalized = Math.floor(n)
  return normalized === 2 || normalized === 3 ? normalized : null
}

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
  const location = useLocation()
  const roleFromState = parseRoleId(location.state?.roleId)
  const roleNameFromState =
    typeof location.state?.roleName === "string" ? location.state.roleName : ""
  const idRolRegistro = roleFromState ?? idRolDesdeEnv()
  const hasExplicitRole = roleFromState !== null
  const roleLabel = roleNameFromState === "propietario" ? "Propietario" : "Cliente"

  const [email, setEmail] = useState("")
  const [contraseña, setContraseña] = useState("")
  const [contraseñaRepetir, setContraseñaRepetir] = useState("")
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
    if (contraseña !== contraseñaRepetir) {
      setError("Las contraseñas no coinciden. Revisá y volvé a intentar.")
      return
    }

    setLoading(true)
    try {
      await registrarUsuario({ email: email.trim(), contraseña }, idRolRegistro)
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

  if (!hasExplicitRole) {
    return <Navigate to="/seleccionar-uso" replace />
  }

  return (
    <div
      className="flex min-h-[100dvh] items-center justify-center bg-gradient-to-b from-slate-100 to-slate-200 p-4 [color-scheme:light]"
    >
      <Card className="w-full max-w-md border border-slate-200 bg-white text-slate-900 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl text-cyan-700">Crear cuenta</CardTitle>
          <CardDescription className="text-slate-600">
            Completa tus datos para crear tu cuenta como {roleLabel}. Revisá tu correo
            para confirmar la cuenta antes de iniciar sesión.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Solo envío semántico: el id_rol real se envía en el body JSON */}
            <input type="hidden" name="id_rol" value={idRolRegistro} readOnly />

            <div className="space-y-2">
              <label htmlFor="reg-email" className="text-sm font-medium text-slate-800">
                Email
              </label>
              <Input
                id="reg-email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={fieldClass}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="reg-pass" className="text-sm font-medium text-slate-800">
                Contraseña (mín. 6 caracteres)
              </label>
              <div className="relative">
                <Input
                  id="reg-pass"
                  name="contraseña"
                  type={mostrarContraseña ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={contraseña}
                  onChange={(e) => setContraseña(e.target.value)}
                  required
                  minLength={6}
                  className={`${fieldClass} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setMostrarContraseña((v) => !v)}
                  className="absolute top-1/2 right-1.5 -translate-y-1/2 rounded-md p-1.5 text-slate-600 transition-colors hover:bg-slate-100 hover:text-cyan-700 focus-visible:ring-2 focus-visible:ring-cyan-500/50 focus-visible:outline-none"
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
                className="text-sm font-medium text-slate-800"
              >
                Repetir contraseña
              </label>
              <div className="relative">
                <Input
                  id="reg-pass-repeat"
                  name="contraseña_repetir"
                  type={mostrarRepetir ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={contraseñaRepetir}
                  onChange={(e) => setContraseñaRepetir(e.target.value)}
                  required
                  minLength={6}
                  className={`${fieldClass} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setMostrarRepetir((v) => !v)}
                  className="absolute top-1/2 right-1.5 -translate-y-1/2 rounded-md p-1.5 text-slate-600 transition-colors hover:bg-slate-100 hover:text-cyan-700 focus-visible:ring-2 focus-visible:ring-cyan-500/50 focus-visible:outline-none"
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
              <p className="text-sm font-medium text-red-600" role="alert">
                {error}
              </p>
            ) : null}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-600 text-white hover:bg-cyan-700"
            >
              {loading ? "Registrando…" : "Registrarme"}
            </Button>
            <p className="text-center text-sm text-slate-600">
              <Link
                to="/login"
                className="font-medium text-cyan-700 underline-offset-2 hover:underline"
              >
                Volver al login
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
