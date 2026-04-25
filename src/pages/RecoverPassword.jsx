import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { solicitarRecuperacionPassword } from "@/services/authService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

// Estilo visual consistente con login/register.
const fieldClass =
  "border-slate-300 bg-white text-slate-900 caret-slate-900 placeholder:text-slate-400 shadow-sm focus-visible:border-sky-500 focus-visible:ring-sky-500/30 dark:border-slate-300 dark:bg-white dark:text-slate-900 dark:placeholder:text-slate-400"

export default function RecoverPassword() {
  const location = useLocation()
  // Si venimos desde login, pre-cargamos el email para ahorrar pasos.
  const initialEmail = typeof location.state?.email === "string" ? location.state.email : ""

  const [email, setEmail] = useState(initialEmail)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)
    try {
      // Llamamos al backend para enviar el correo de recuperación.
      const msg = await solicitarRecuperacionPassword(email.trim())
      setSuccess(msg)
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar el correo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-gradient-to-b from-slate-100 to-slate-200 p-4 [color-scheme:light]">
      <Card className="w-full max-w-md border border-slate-200 bg-white text-slate-900 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl text-cyan-700">Recuperar contraseña</CardTitle>
          <CardDescription className="text-slate-600">
            Ingresá tu correo y te enviamos un enlace para restablecerla.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="space-y-2">
              <label htmlFor="recover-email" className="text-sm font-medium text-slate-800">
                Correo electrónico
              </label>
              <Input
                id="recover-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={fieldClass}
              />
            </div>

            {error ? (
              <p className="text-sm font-medium text-red-600" role="alert">
                {error}
              </p>
            ) : null}
            {success ? (
              <p className="text-sm font-medium text-emerald-700" role="status">
                {success}
              </p>
            ) : null}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-600 text-white hover:bg-cyan-700"
            >
              {loading ? "Enviando..." : "Enviar correo de recuperación"}
            </Button>

            <p className="text-center text-sm text-slate-600">
              <Link to="/login" className="font-medium text-cyan-700 underline-offset-2 hover:underline">
                Volver al login
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
