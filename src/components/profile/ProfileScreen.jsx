import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getStoredEmail, getUserIdFromToken, logout } from "@/services/authService"
import {
  getPerfilUsuario,
  actualizarPerfilUsuario,
  actualizarImagenPerfil,
  cambiarPassword,
} from "@/services/usuariosService"

function formatFecha(value) {
  if (!value) return "-"
  try {
    return new Date(value).toLocaleDateString("es-AR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
  } catch {
    return String(value)
  }
}

function getRoleMeta(perfil) {
  const roleObj =
    typeof perfil?.rol === "object" && perfil?.rol !== null ? perfil.rol : null
  const idRol = Number(
    roleObj?.id_rol ?? perfil?.id_rol ?? perfil?.rol_id ?? perfil?.idRol ?? NaN
  )
  const codigoRaw =
    roleObj?.codigo ?? roleObj?.tipo ?? perfil?.rol_codigo ?? perfil?.rol ?? perfil?.tipo
  const codigo = String(codigoRaw ?? "").trim().toUpperCase()
  const nombreRaw = roleObj?.nombre ?? roleObj?.tipo ?? perfil?.rol_nombre
  const nombre = String(nombreRaw ?? "").trim()

  if (idRol === 2 || codigo === "CLIENTE") {
    return { id: 2, label: "Cliente" }
  }
  if (idRol === 3 || codigo === "PROPIETARIO") {
    return { id: 3, label: "Propietario" }
  }
  if (idRol === 1 || codigo === "ADMIN") {
    return { id: 1, label: "Admin" }
  }

  if (nombre) return { id: null, label: nombre }
  if (codigo) return { id: null, label: codigo }
  return { id: null, label: "-" }
}

export default function ProfileScreen({ onBack, onSessionExpired }) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [changingPass, setChangingPass] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [perfil, setPerfil] = useState(null)
  const [form, setForm] = useState({ nombre: "", apellido: "", telefono: "" })
  const [passForm, setPassForm] = useState({
    passwordActual: "",
    passwordNueva: "",
    confirmarPassword: "",
  })

  const userId = useMemo(() => getUserIdFromToken(), [])

  useEffect(() => {
    if (!userId) {
      onSessionExpired?.()
      return
    }

    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError("")
      try {
        const data = await getPerfilUsuario(userId)
        if (cancelled) return
        setPerfil(data)
        setForm({
          nombre: data?.nombre ?? "",
          apellido: data?.apellido ?? "",
          telefono: data?.telefono ?? "",
        })
      } catch (err) {
        if (cancelled) return
        if (err?.status === 401 || err?.status === 403) {
          onSessionExpired?.()
          return
        }
        setError(err instanceof Error ? err.message : "No se pudo cargar el perfil")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [onSessionExpired, userId])

  async function handleGuardarPerfil(e) {
    e.preventDefault()
    setError("")
    setMessage("")
    setSaving(true)
    try {
      const payload = {
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        telefono: form.telefono.trim(),
      }
      await actualizarPerfilUsuario(userId, payload)
      const refreshed = await getPerfilUsuario(userId)
      setPerfil(refreshed)
      setMessage("Perfil actualizado correctamente.")
    } catch (err) {
      if (err?.status === 401 || err?.status === 403) {
        onSessionExpired?.()
        return
      }
      setError(err instanceof Error ? err.message : "No se pudo actualizar el perfil")
    } finally {
      setSaving(false)
    }
  }

  async function handleCambiarImagen(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setError("")
    setMessage("")
    setUploading(true)
    try {
      await actualizarImagenPerfil(userId, file)
      const refreshed = await getPerfilUsuario(userId)
      setPerfil(refreshed)
      setMessage("Imagen actualizada correctamente.")
    } catch (err) {
      if (err?.status === 401 || err?.status === 403) {
        onSessionExpired?.()
        return
      }
      setError(err instanceof Error ? err.message : "No se pudo actualizar la imagen")
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  async function handleCambiarPassword(e) {
    e.preventDefault()
    setError("")
    setMessage("")
    setChangingPass(true)
    try {
      await cambiarPassword(passForm)
      setPassForm({
        passwordActual: "",
        passwordNueva: "",
        confirmarPassword: "",
      })
      setMessage("Contrasena actualizada correctamente.")
    } catch (err) {
      if (err?.status === 401 || err?.status === 403) {
        onSessionExpired?.()
        return
      }
      setError(err instanceof Error ? err.message : "No se pudo cambiar la contrasena")
    } finally {
      setChangingPass(false)
    }
  }

  const avatarUrl =
    perfil?.imagen ??
    perfil?.avatar ??
    perfil?.avatar_url ??
    perfil?.imagen_url ??
    null
  const fullName = [perfil?.nombre, perfil?.apellido].filter(Boolean).join(" ").trim()
  const roleMeta = getRoleMeta(perfil)
  const rolTipo = roleMeta.label
  const fechaRegistro = perfil?.fecha_registro ?? perfil?.fechaRegistro ?? null
  const suspendidoValue = perfil?.suspendido
  const suspendidoLabel =
    typeof suspendidoValue === "boolean" ? (suspendidoValue ? "Si" : "No") : "-"

  if (loading) {
    return (
      <section className="absolute inset-0 z-[1001] flex items-center justify-center bg-[#0f1115] text-slate-200">
        Cargando perfil...
      </section>
    )
  }

  return (
    <section className="absolute inset-0 z-[1001] overflow-y-auto bg-[#0f1115] text-slate-100">
      <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col gap-4 px-4 pt-5 pb-8">
        <header className="rounded-3xl border border-white/10 bg-[#13161c] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.25)]">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-white/20 bg-slate-800 ring-2 ring-white/10">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-slate-300">
                  {(fullName || getStoredEmail() || "U").charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-semibold tracking-tight">
                {fullName || "Perfil"}
              </h1>
              <p className="mt-0.5 text-sm text-slate-400">
                {perfil?.email ?? getStoredEmail() ?? "Sin email"}
              </p>
              <span className="mt-2 inline-flex rounded-full border border-white/15 bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-slate-200">
                Rol: {rolTipo}
              </span>
            </div>
          </div>
        </header>

        {error ? (
          <p className="rounded-xl border border-red-300/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="rounded-xl border border-emerald-300/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
            {message}
          </p>
        ) : null}

        <section className="rounded-3xl border border-white/10 bg-[#13161c] p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">
            Datos de cuenta
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <ReadOnlyField label="Email" value={perfil?.email ?? getStoredEmail() ?? "-"} />
            <ReadOnlyField label="Rol" value={rolTipo} />
            <ReadOnlyField label="Fecha registro" value={formatFecha(fechaRegistro)} />
            <ReadOnlyField label="Suspendido" value={suspendidoLabel} />
          </div>
        </section>

        <form onSubmit={handleGuardarPerfil} className="rounded-3xl border border-white/10 bg-[#13161c] p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">
            Datos personales
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs text-slate-400">Nombre</label>
              <Input
                value={form.nombre}
                onChange={(e) => setForm((prev) => ({ ...prev, nombre: e.target.value }))}
                required
                className="h-11 rounded-xl border-white/15 bg-white/[0.04] text-slate-100"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-400">Apellido</label>
              <Input
                value={form.apellido}
                onChange={(e) => setForm((prev) => ({ ...prev, apellido: e.target.value }))}
                required
                className="h-11 rounded-xl border-white/15 bg-white/[0.04] text-slate-100"
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs text-slate-400">Telefono</label>
              <Input
                value={form.telefono}
                onChange={(e) => setForm((prev) => ({ ...prev, telefono: e.target.value }))}
                className="h-11 rounded-xl border-white/15 bg-white/[0.04] text-slate-100"
              />
            </div>
          </div>
          <Button
            type="submit"
            disabled={saving}
            className="mt-4 h-11 w-full rounded-xl bg-slate-100 text-slate-900 hover:bg-white"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </Button>
        </form>

        <section className="rounded-3xl border border-white/10 bg-[#13161c] p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">
            Avatar
          </h2>
          <label className="inline-flex h-11 cursor-pointer items-center justify-center rounded-xl border border-white/15 bg-white/[0.04] px-4 text-sm font-medium text-slate-100 hover:bg-white/[0.08]">
            {uploading ? "Subiendo..." : "Cambiar foto"}
            <input
              type="file"
              accept=".jpg,.jpeg,.png"
              className="sr-only"
              onChange={handleCambiarImagen}
              disabled={uploading}
            />
          </label>
          <p className="mt-2 text-xs text-slate-500">Maximo 4MB, formatos .jpg, .jpeg, .png</p>
        </section>

        <form onSubmit={handleCambiarPassword} className="rounded-3xl border border-white/10 bg-[#13161c] p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">
            Seguridad
          </h2>
          <div className="grid gap-3">
            <div className="space-y-1">
              <label className="text-xs text-slate-400">Contrasena actual</label>
              <Input
                type="password"
                value={passForm.passwordActual}
                onChange={(e) =>
                  setPassForm((prev) => ({ ...prev, passwordActual: e.target.value }))
                }
                className="h-11 rounded-xl border-white/15 bg-white/[0.04] text-slate-100"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-400">Nueva contrasena</label>
              <Input
                type="password"
                value={passForm.passwordNueva}
                onChange={(e) =>
                  setPassForm((prev) => ({ ...prev, passwordNueva: e.target.value }))
                }
                className="h-11 rounded-xl border-white/15 bg-white/[0.04] text-slate-100"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-400">Confirmar nueva contrasena</label>
              <Input
                type="password"
                value={passForm.confirmarPassword}
                onChange={(e) =>
                  setPassForm((prev) => ({ ...prev, confirmarPassword: e.target.value }))
                }
                className="h-11 rounded-xl border-white/15 bg-white/[0.04] text-slate-100"
              />
            </div>
          </div>
          <Button
            type="submit"
            disabled={
              changingPass ||
              !passForm.passwordActual ||
              !passForm.passwordNueva ||
              !passForm.confirmarPassword
            }
            className="mt-4 h-11 w-full rounded-xl bg-white/[0.08] text-slate-100 hover:bg-white/[0.12]"
          >
            {changingPass ? "Actualizando..." : "Cambiar contrasena"}
          </Button>
        </form>

        <div className="mt-1 grid gap-2 sm:grid-cols-2">
          <Button
            type="button"
            variant="outline"
            className="border-white/20 bg-transparent text-slate-200 hover:bg-white/[0.06]"
            onClick={onBack}
          >
            Cancelar / Volver
          </Button>
          <Button
            type="button"
            variant="outline"
            className="border-white/20 bg-transparent text-slate-200 hover:bg-white/[0.06]"
            onClick={() => {
              logout()
              onSessionExpired?.()
            }}
          >
            Cerrar sesion
          </Button>
        </div>
      </div>
    </section>
  )
}

function ReadOnlyField({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
      <p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm text-slate-100">{value}</p>
    </div>
  )
}
