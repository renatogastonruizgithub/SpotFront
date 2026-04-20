import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, LogOut, Pencil, Shield } from "lucide-react"
import { getStoredEmail, getUserIdFromToken, getRoleFromToken } from "@/services/authService"
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

function getRoleMeta(perfil, tokenRole) {
  const tokenRoleNormalized = String(tokenRole ?? "").trim().toUpperCase()
  if (tokenRoleNormalized === "CLIENTE") {
    return { id: 2, label: "Cliente" }
  }
  if (tokenRoleNormalized === "PROPIETARIO") {
    return { id: 3, label: "Propietario" }
  }
  if (tokenRoleNormalized === "ADMIN") {
    return { id: 1, label: "Admin" }
  }

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
  const [isEditing, setIsEditing] = useState(false)
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
  const tokenRole = useMemo(() => getRoleFromToken(), [])

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

  useEffect(() => {
    if (!message) return undefined
    const timer = setTimeout(() => {
      setMessage("")
    }, 3000)
    return () => clearTimeout(timer)
  }, [message])

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

  async function handleGuardarCambios() {
    if (!isEditing) {
      setError("")
      setMessage("")
      setIsEditing(true)
      return
    }

    setError("")
    setMessage("")

    const hasPasswordInput =
      Boolean(passForm.passwordActual) ||
      Boolean(passForm.passwordNueva) ||
      Boolean(passForm.confirmarPassword)

    if (hasPasswordInput) {
      if (!passForm.passwordActual || !passForm.passwordNueva || !passForm.confirmarPassword) {
        setError("Para seguridad, completa todos los campos de contrasena.")
        return
      }
      if (passForm.passwordNueva !== passForm.confirmarPassword) {
        setError("La nueva contrasena y su confirmacion no coinciden.")
        return
      }
    }

    const success = []

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
      success.push("Perfil actualizado.")
    } catch (err) {
      if (err?.status === 401 || err?.status === 403) {
        onSessionExpired?.()
        return
      }
      setError(err instanceof Error ? err.message : "No se pudo actualizar el perfil")
      return
    } finally {
      setSaving(false)
    }

    if (hasPasswordInput) {
      setChangingPass(true)
      try {
        await cambiarPassword(passForm)
        setPassForm({
          passwordActual: "",
          passwordNueva: "",
          confirmarPassword: "",
        })
        success.push("Contrasena actualizada.")
      } catch (err) {
        if (err?.status === 401 || err?.status === 403) {
          onSessionExpired?.()
          return
        }
        setError(err instanceof Error ? err.message : "No se pudo cambiar la contrasena")
        return
      } finally {
        setChangingPass(false)
      }
    }

    if (success.length > 0) {
      setMessage(success.join(" "))
      setIsEditing(false)
    }
  }

  const avatarUrl =
    perfil?.imagen ??
    perfil?.avatar ??
    perfil?.avatar_url ??
    perfil?.imagen_url ??
    null
  const fullName = [perfil?.nombre, perfil?.apellido].filter(Boolean).join(" ").trim()
  const roleMeta = getRoleMeta(perfil, tokenRole)
  const rolTipo = roleMeta.label
  const fechaRegistro = perfil?.fecha_registro ?? perfil?.fechaRegistro ?? null
  const suspendidoValue = perfil?.suspendido
  const suspendidoLabel =
    typeof suspendidoValue === "boolean" ? (suspendidoValue ? "Si" : "No") : "-"

  if (loading) {
    return (
      <section className="absolute inset-0 z-[1001] flex items-center justify-center bg-[#f2f3f8] text-[#34415f]">
        Cargando perfil...
      </section>
    )
  }

  return (
    <section className="absolute inset-0 z-[1001] overflow-y-auto bg-[#f2f3f8] text-[#23314f]">
      <div className="mx-auto flex min-h-full w-full max-w-md flex-col px-4 pb-8">
        <header className="sticky top-0 z-10 -mx-4 mb-4 border-b border-[#e5e8f1] bg-[#f2f3f8]/95 px-4 py-3 backdrop-blur-sm">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-sm text-[#5a6784]"
            >
              <ArrowLeft size={16} />
              Volver al mapa
            </button>
            <h1 className="text-center text-lg font-semibold text-[#23314f]">Profile</h1>
            <div />
          </div>
        </header>

        {error ? (
          <p className="mb-3 rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="mb-3 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {message}
          </p>
        ) : null}

        <section className="mb-6 flex flex-col items-center">
          <div className="relative flex w-full justify-center">
            <div className="relative h-24 w-24 overflow-visible">
              <div className="h-full w-full overflow-hidden rounded-full border-2 border-[#d2d8ea] bg-[#dfe4f2] shadow-sm">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-3xl font-semibold text-[#5d6882]">
                    {(fullName || getStoredEmail() || "U").charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              {isEditing ? (
                <label className="absolute right-[-4px] bottom-[-4px] z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-[#4f5c78] text-white shadow-[0_4px_10px_rgba(0,0,0,0.25)] transition-transform hover:scale-105">
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    className="sr-only"
                    onChange={handleCambiarImagen}
                    disabled={uploading}
                  />
                  <span className="text-lg leading-none font-semibold" aria-hidden>
                    {uploading ? "…" : "+"}
                  </span>
                  <span className="sr-only">
                    {uploading ? "Subiendo imagen" : "Agregar imagen de perfil"}
                  </span>
                </label>
              ) : null}
            </div>
          </div>
          <button
            type="button"
            onClick={handleGuardarCambios}
            disabled={saving || changingPass}
            className="mt-2 inline-flex h-7 items-center gap-1 rounded-full border border-[#cdd3e4] bg-white px-2.5 text-[11px] font-semibold text-[#4f5c78] shadow-sm hover:bg-[#f8f9fe] disabled:opacity-60"
          >
            <Pencil size={11} />
            {saving || changingPass ? "Guardando..." : isEditing ? "Guardar cambios" : "Editar perfil"}
          </button>
          <h2 className="mt-4 text-[44px] leading-none font-bold tracking-tight text-[#233a67]">
            {fullName || "Perfil"}
          </h2>
          <p className="mt-2 text-sm text-[#7f89a4]">{perfil?.email ?? getStoredEmail() ?? "-"}</p>
        </section>

        <section className="mb-5">
          <h3 className="mb-3 text-xs font-semibold tracking-[0.16em] text-[#606c89] uppercase">
            Datos de cuenta
          </h3>
          <div className="grid grid-cols-1 gap-3 rounded-2xl bg-[#eceef7] p-4">
            <ReadOnlyField label="Email" value={perfil?.email ?? getStoredEmail() ?? "-"} />
            <ReadOnlyField label="Tipo de rol" value={rolTipo} />
            <ReadOnlyField label="Registro" value={formatFecha(fechaRegistro)} />
            <ReadOnlyField
              label="Estado"
              value={suspendidoLabel === "No" ? "Activo" : suspendidoLabel}
              withStatus={suspendidoLabel === "No"}
            />
          </div>
        </section>

        <form onSubmit={handleGuardarPerfil} className="mb-6">
          <h3 className="mb-1 text-xs font-semibold tracking-[0.16em] text-[#606c89] uppercase">
            Datos personales
          </h3>
          <p className="mb-3 text-xs text-[#7b86a1]">
            {isEditing ? "Modo edicion activo: puedes modificar estos datos." : "Bloqueado: toca 'Editar perfil' para habilitar cambios."}
          </p>
          <div className="grid gap-4 rounded-2xl bg-[#eceef7] p-4">
            <div className="space-y-2">
              <label className="text-[11px] font-semibold tracking-wide text-[#5d6882] uppercase">Nombre</label>
              <Input
                value={form.nombre}
                onChange={(e) => setForm((prev) => ({ ...prev, nombre: e.target.value }))}
                required
                disabled={!isEditing}
                className="h-12 rounded-xl border-[#e5e8f1] bg-[#eceef7] text-[#2d3b5a] shadow-none disabled:cursor-not-allowed disabled:opacity-70"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-semibold tracking-wide text-[#5d6882] uppercase">Apellido</label>
              <Input
                value={form.apellido}
                onChange={(e) => setForm((prev) => ({ ...prev, apellido: e.target.value }))}
                required
                disabled={!isEditing}
                className="h-12 rounded-xl border-[#e5e8f1] bg-[#eceef7] text-[#2d3b5a] shadow-none disabled:cursor-not-allowed disabled:opacity-70"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-semibold tracking-wide text-[#5d6882] uppercase">Telefono</label>
              <Input
                value={form.telefono}
                onChange={(e) => setForm((prev) => ({ ...prev, telefono: e.target.value }))}
                disabled={!isEditing}
                className="h-12 rounded-xl border-[#e5e8f1] bg-[#eceef7] text-[#2d3b5a] shadow-none disabled:cursor-not-allowed disabled:opacity-70"
              />
            </div>
          </div>
        </form>

        <form onSubmit={handleCambiarPassword} className="mb-6">
          <h3 className="mb-1 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.16em] text-[#606c89] uppercase">
            <Shield size={14} />
            Seguridad
          </h3>
          <p className="mb-3 text-xs text-[#7b86a1]">
            {isEditing ? "Puedes cambiar la contrasena en este bloque." : "Bloqueado: habilita edicion para actualizar seguridad."}
          </p>
          <div className="grid gap-4 rounded-2xl bg-[#eceef7] p-4">
            <div className="space-y-2">
              <label className="text-[11px] font-semibold tracking-wide text-[#5d6882] uppercase">Contrasena actual</label>
              <Input
                type="password"
                value={passForm.passwordActual}
                onChange={(e) =>
                  setPassForm((prev) => ({ ...prev, passwordActual: e.target.value }))
                }
                disabled={!isEditing}
                className="h-12 rounded-xl border-[#e5e8f1] bg-[#eceef7] text-[#2d3b5a] shadow-none disabled:cursor-not-allowed disabled:opacity-70"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-semibold tracking-wide text-[#5d6882] uppercase">Nueva contrasena</label>
              <Input
                type="password"
                value={passForm.passwordNueva}
                onChange={(e) =>
                  setPassForm((prev) => ({ ...prev, passwordNueva: e.target.value }))
                }
                disabled={!isEditing}
                className="h-12 rounded-xl border-[#e5e8f1] bg-[#eceef7] text-[#2d3b5a] shadow-none disabled:cursor-not-allowed disabled:opacity-70"
                placeholder="Min. 8 caracteres"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-semibold tracking-wide text-[#5d6882] uppercase">Confirmar contrasena</label>
              <Input
                type="password"
                value={passForm.confirmarPassword}
                onChange={(e) =>
                  setPassForm((prev) => ({ ...prev, confirmarPassword: e.target.value }))
                }
                disabled={!isEditing}
                className="h-12 rounded-xl border-[#e5e8f1] bg-[#eceef7] text-[#2d3b5a] shadow-none disabled:cursor-not-allowed disabled:opacity-70"
                placeholder="Repite la contrasena"
              />
            </div>
          </div>
        </form>

        <div className="mt-auto">
          <button
            type="button"
            className="mx-auto mb-4 inline-flex w-full items-center justify-center gap-2 text-[15px] font-semibold text-[#874d58]"
            onClick={onSessionExpired}
          >
            <LogOut size={16} />
            Cerrar sesion
          </button>
          <p className="mt-3 text-center text-[12px] font-semibold tracking-[0.18em] text-[#7f89a4]">
            SPOT
          </p>
          <p className="mt-3 text-center text-[11px] text-[#8892ab]">
            Avatar: maximo 4MB, formatos .jpg, .jpeg, .png
          </p>
        </div>
      </div>
    </section>
  )
}

function ReadOnlyField({ label, value, withStatus = false }) {
  return (
    <div className="rounded-lg bg-[#eceef7] px-2 py-1">
      <p className="text-[10px] font-semibold tracking-wide text-[#68738f] uppercase">{label}</p>
      <p className="mt-1 text-sm text-[#2f3b58]">
        {withStatus ? <span className="mr-1 inline-block h-2 w-2 rounded-full bg-emerald-500" /> : null}
        {value}
      </p>
    </div>
  )
}
