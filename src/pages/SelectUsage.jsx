import { useState } from "react"
import { Navigate, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  asignarRol,
  getHomeRouteByRole,
  indicatesRoleAlreadyAssignedError,
  isAuthenticated,
  needsRoleAssignment,
  setOnboardingChoice,
  setRoleGateOverride,
} from "@/services/authService"
import { Compass, Sparkles, Store } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

function mensajeErrorAsignacion(err) {
  const status = err && typeof err === "object" && "status" in err ? Number(err.status) : 0
  const msg = err instanceof Error ? err.message : ""
  if (status === 500 || status >= 500) {
    return "Error del servidor. Intentá nuevamente en unos minutos."
  }
  if (status === 403) {
    return msg || "No podés elegir ese perfil con este método."
  }
  if (status === 404) {
    return msg || "No se encontró el usuario."
  }
  return msg || "No se pudo guardar tu perfil."
}

export default function SelectUsage() {
  const navigate = useNavigate()
  const authenticated = isAuthenticated()
  const [selectedOption, setSelectedOption] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  if (!authenticated) {
    return <Navigate to="/login" replace />
  }

  if (!needsRoleAssignment()) {
    return <Navigate to={getHomeRouteByRole()} replace />
  }

  const options = [
    {
      id: "explorar",
      title: "Explorar bares y lugares",
      description: "Descubrí bares, promociones y eventos cerca tuyo.",
      helper: "Ideal para salir y descubrir promos",
      icon: Compass,
      nuevoRol: "explorador",
    },
    {
      id: "publicar",
      title: "Publicar mi bar o negocio",
      description: "Administrá tu bar, publicá promociones y llegá a más clientes.",
      helper: "Ideal para dueños y emprendedores",
      icon: Store,
      nuevoRol: "propietario",
    },
  ]

  const selected = options.find((option) => option.id === selectedOption) ?? null

  async function handleContinue() {
    if (!selected || loading) return
    setError("")
    setLoading(true)
    try {
      await asignarRol(selected.nuevoRol)
      setOnboardingChoice(selected.nuevoRol === "explorador" ? "cliente" : "propietario")
      navigate(getHomeRouteByRole(), { replace: true })
    } catch (err) {
      const msg = err instanceof Error ? err.message : ""
      if (indicatesRoleAlreadyAssignedError(msg)) {
        setRoleGateOverride()
        navigate(getHomeRouteByRole(), { replace: true })
        return
      }
      setError(mensajeErrorAsignacion(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-gradient-to-b from-[#f8fbff] via-slate-50 to-slate-100 p-4 [color-scheme:light]">
      <Card className="w-full max-w-lg border border-slate-200/80 bg-white/95 text-slate-900 shadow-[0_16px_35px_rgba(15,23,42,0.10)]">
        <CardHeader className="space-y-3 pb-4">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
            <Sparkles size={14} />
            Bienvenido a SPOT
          </div>
          <CardTitle className="text-[1.9rem] leading-tight font-bold tracking-tight text-slate-900">
            Elegí tu perfil
          </CardTitle>
          <CardDescription className="text-sm text-slate-600">
            Una sola vez definís si usás Spot como explorador o como propietario. Podés cambiar el
            detalle de tu cuenta más adelante desde el perfil si hace falta.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 pb-5">
          {options.map((option) => {
            const isSelected = selectedOption === option.id
            const Icon = option.icon
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setSelectedOption(option.id)}
                className={`w-full rounded-2xl border p-4 text-left transition-all focus-visible:ring-2 focus-visible:ring-slate-900/20 focus-visible:outline-none ${
                  isSelected
                    ? "border-sky-500 bg-gradient-to-r from-sky-50 to-white shadow-[0_10px_24px_rgba(2,132,199,0.16)]"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-[0_6px_16px_rgba(15,23,42,0.10)]"
                }`}
                aria-pressed={isSelected}
                disabled={loading}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      isSelected ? "bg-sky-500 text-white" : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    <Icon size={20} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-base font-semibold text-slate-900">{option.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{option.description}</p>
                    <p className="mt-2 text-xs font-medium text-slate-500">{option.helper}</p>
                    {isSelected ? (
                      <span className="mt-3 inline-flex rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700">
                        Seleccionado
                      </span>
                    ) : null}
                  </div>
                </div>
              </button>
            )
          })}
          {error ? (
            <p className="text-sm font-medium text-red-600" role="alert">
              {error}
            </p>
          ) : null}
          <Button
            type="button"
            onClick={handleContinue}
            disabled={!selected || loading}
            className="mt-3 h-11 w-full rounded-xl bg-slate-900 text-base font-semibold text-white shadow-[0_10px_20px_rgba(15,23,42,0.25)] hover:bg-slate-800 disabled:bg-slate-300 disabled:shadow-none"
          >
            {loading ? "Guardando..." : "Continuar"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
