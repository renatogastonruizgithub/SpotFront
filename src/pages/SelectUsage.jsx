import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { fetchRoles } from "@/services/usuariosService"
import { Compass, Sparkles, Store } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

function getRoleIds() {
  const cliente = Number(import.meta.env.VITE_REGISTRO_ID_ROL_CLIENTE)
  const propietario = Number(import.meta.env.VITE_REGISTRO_ID_ROL_PROPIETARIO)
  const clienteSafe =
    Number.isFinite(cliente) && cliente > 0 ? Math.floor(cliente) : 2
  const propietarioSafe =
    Number.isFinite(propietario) && propietario > 0 ? Math.floor(propietario) : 3

  return {
    cliente: clienteSafe === 2 || clienteSafe === 3 ? clienteSafe : 2,
    propietario:
      propietarioSafe === 2 || propietarioSafe === 3 ? propietarioSafe : 3,
  }
}

export default function SelectUsage() {
  const navigate = useNavigate()
  const [selectedOption, setSelectedOption] = useState("")
  const roleIds = useMemo(() => getRoleIds(), [])
  const [rolesPublicos, setRolesPublicos] = useState([])
  const [errorRoles, setErrorRoles] = useState("")

  useEffect(() => {
    let cancelled = false

    async function loadRoles() {
      setErrorRoles("")
      try {
        const roles = await fetchRoles()
        if (!cancelled) {
          setRolesPublicos(Array.isArray(roles) ? roles : [])
        }
      } catch (err) {
        if (!cancelled) {
          setRolesPublicos([])
          setErrorRoles(err instanceof Error ? err.message : "No se pudieron cargar los roles")
        }
      }
    }

    loadRoles()
    return () => {
      cancelled = true
    }
  }, [])

  const roleCliente =
    rolesPublicos.find((role) => String(role?.codigo ?? "").toUpperCase() === "CLIENTE") ??
    null
  const rolePropietario =
    rolesPublicos.find((role) => String(role?.codigo ?? "").toUpperCase() === "PROPIETARIO") ??
    null
  const roleClienteId = Number(roleCliente?.id_rol)
  const rolePropietarioId = Number(rolePropietario?.id_rol)

  const options = [
    {
      id: "explorar",
      title: "Explorar bares y lugares",
      description: "Descubre bares, promociones y eventos cerca de ti.",
      helper: "Ideal para salir y descubrir promos",
      icon: Compass,
      roleId: roleClienteId === 2 ? 2 : roleIds.cliente,
      roleName: "cliente",
    },
    {
      id: "publicar",
      title: "Publicar mi bar o negocio",
      description: "Administra tu bar, publica promociones y llega a más clientes.",
      helper: "Ideal para dueños y emprendedores",
      icon: Store,
      roleId: rolePropietarioId === 3 ? 3 : roleIds.propietario,
      roleName: "propietario",
    },
  ]

  const selectedRole = options.find((option) => option.id === selectedOption) ?? null

  function handleContinue() {
    if (!selectedRole) return
    navigate("/register", {
      state: {
        roleId: selectedRole.roleId,
        roleName: selectedRole.roleName,
      },
    })
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
            ¿Cómo quieres usar Spot?
          </CardTitle>
          <CardDescription className="text-sm text-slate-600">
            Elige una opción para personalizar tu experiencia desde el inicio.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 pb-5">
          {errorRoles ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              {errorRoles}. Se usarán valores de respaldo para continuar.
            </p>
          ) : null}
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
          <Button
            type="button"
            onClick={handleContinue}
            disabled={!selectedRole}
            className="mt-3 h-11 w-full rounded-xl bg-slate-900 text-base font-semibold text-white shadow-[0_10px_20px_rgba(15,23,42,0.25)] hover:bg-slate-800 disabled:bg-slate-300 disabled:shadow-none"
          >
            Continuar
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
