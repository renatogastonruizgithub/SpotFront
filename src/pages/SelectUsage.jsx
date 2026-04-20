import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { fetchRoles } from "@/services/usuariosService"
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
      roleId: roleClienteId === 2 ? 2 : roleIds.cliente,
      roleName: "cliente",
    },
    {
      id: "publicar",
      title: "Publicar mi bar o negocio",
      description: "Administra tu bar, publica promociones y llega a más clientes.",
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
    <div className="flex min-h-[100dvh] items-center justify-center bg-slate-50 p-4 [color-scheme:light]">
      <Card className="w-full max-w-lg border border-slate-200 bg-white text-slate-900 shadow-sm">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-semibold tracking-tight text-slate-900">
            ¿Cómo quieres usar Spot?
          </CardTitle>
          <CardDescription className="text-sm text-slate-600">
            Elige una opción para personalizar tu registro.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {errorRoles ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              {errorRoles}. Se usarán valores de respaldo para continuar.
            </p>
          ) : null}
          {options.map((option) => {
            const isSelected = selectedOption === option.id
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setSelectedOption(option.id)}
                className={`w-full rounded-xl border p-4 text-left transition-all focus-visible:ring-2 focus-visible:ring-slate-900/20 focus-visible:outline-none ${
                  isSelected
                    ? "border-slate-900 bg-white shadow-[0_4px_14px_rgba(15,23,42,0.12)]"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
                aria-pressed={isSelected}
              >
                <p className="text-base font-medium text-slate-900">{option.title}</p>
                <p className="mt-1 text-sm text-slate-600">{option.description}</p>
                {isSelected ? (
                  <span className="mt-3 inline-flex rounded-full border border-slate-300 px-2 py-0.5 text-xs text-slate-700">
                    Seleccionado
                  </span>
                ) : null}
              </button>
            )
          })}
          <Button
            type="button"
            onClick={handleContinue}
            disabled={!selectedRole}
            className="mt-2 w-full bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-300"
          >
            Continuar
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
