import { useState } from "react"
import { Navigate, useNavigate } from "react-router-dom"
import { ArrowLeft, Compass, Store } from "lucide-react"
import UsageOptionCard from "@/components/select-usage/UsageOptionCard"
import {
  asignarRol,
  getHomeRouteByRole,
  indicatesRoleAlreadyAssignedError,
  isAuthenticated,
  needsRoleAssignment,
  setOnboardingChoice,
  setRoleGateOverride,
} from "@/services/authService"

// Traduce errores HTTP de PATCH rol a mensajes claros para el usuario en español.
function mensajeErrorAsignacion(err) {
  const status = err && typeof err === "object" && "status" in err ? Number(err.status) : 0 // Extrae código HTTP si existe
  const msg = err instanceof Error ? err.message : "" // Mensaje de Error o cadena vacía
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

// Pantalla de onboarding: el usuario elige explorar bares o publicar su bar y se asigna el rol en el backend.
export default function SelectUsage() {
  const navigate = useNavigate() // Hook de react-router para navegar programáticamente (continuar / volver)
  const authenticated = isAuthenticated() // true si hay JWT válido en almacenamiento del cliente
  const [selectedOption, setSelectedOption] = useState("") // "" | "explorar" | "publicar": opción activa en la UI
  const [loading, setLoading] = useState(false) // true mientras se llama a asignarRol
  const [error, setError] = useState("") // Mensaje de error visible bajo las tarjetas si falla la API

  // Sin sesión no puede asignar rol: redirige al login.
  if (!authenticated) {
    return <Navigate to="/login" replace />
  }

  // Si el JWT ya trae rol asignado, no mostrar esta pantalla: va al home correspondiente.
  if (!needsRoleAssignment()) {
    return <Navigate to={getHomeRouteByRole()} replace />
  }

  // Datos de cada tarjeta: textos del diseño + rol API + ícono y estilo del cuadrado del ícono.
  const options = [
    {
      id: "explorar", // Valor que guardamos en selectedOption al elegir la primera card
      title: "Explorar bares", // Encabezado en negrita de la opción 1
      description: "Descubrí bares, promos y lugares cerca tuyo", // Cuerpo gris bajo el título
      nuevoRol: "explorador", // Valor enviado en PATCH /Auth/asignar-rol para modo explorador
      icon: Compass, // Ícono brújula dentro del cuadrado negro
      exploreVariant: true, // Activa cuadrado negro + ícono blanco
    },
    {
      id: "publicar", // Valor para la segunda card
      title: "Publicar mi bar", // Encabezado opción 2
      description: "Mostrá tu bar, promociones y llegá a más clientes", // Cuerpo según brief
      nuevoRol: "propietario", // Rol de dueño en el backend
      icon: Store, // Ícono tienda / negocio
      exploreVariant: false, // Cuadrado con fondo gris claro e ícono oscuro
    },
  ]

  // Objeto de la opción actualmente elegida; null si selectedOption sigue vacío.
  const selected = options.find((option) => option.id === selectedOption) ?? null

  // Envía el rol al servidor y redirige al mapa o flujo de propietario según respuesta.
  async function handleContinue() {
    if (!selected || loading) return // No hace nada sin selección o durante una petición en curso
    setError("") // Limpia error previo antes de reintentar
    setLoading(true) // Deshabilita botón y tarjetas visualmente
    try {
      await asignarRol(selected.nuevoRol) // PATCH rol en backend según la opción elegida
      setOnboardingChoice(selected.nuevoRol === "explorador" ? "cliente" : "propietario") // Persiste elección local para la app
      navigate(getHomeRouteByRole(), { replace: true }) // Entra al home acorde al nuevo rol
    } catch (err) {
      const msg = err instanceof Error ? err.message : ""
      if (indicatesRoleAlreadyAssignedError(msg)) {
        setRoleGateOverride() // Sincroniza estado local si el backend dice que el rol ya estaba asignado
        navigate(getHomeRouteByRole(), { replace: true })
        return
      }
      setError(mensajeErrorAsignacion(err)) // Muestra feedback amigable en pantalla
    } finally {
      setLoading(false) // Rehabilita UI al terminar éxito o error
    }
  }

  return (
    // Shell mobile-first: alto mínimo viewport, fondo gris suave, tipografía y esquema claro.
    <div className="relative flex min-h-[100dvh] flex-col bg-[#f7f7f7] text-neutral-900 [color-scheme:light]">
      {/* Cabecera fija visualmente al flujo superior: flecha atrás + título centrado “Spot”. */}
      <header className="relative flex shrink-0 items-center justify-center px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))]">
        {/* Vuelve a la pantalla anterior del historial (p. ej. login); aria-label para accesibilidad. */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute left-4 top-[max(0.75rem,env(safe-area-inset-top))] inline-flex h-10 w-10 items-center justify-center rounded-full text-neutral-900 transition-colors hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
          aria-label="Volver"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={2} aria-hidden />
        </button>
        {/* Marca de la app centrada en la cabecera */}
        <h1 className="text-lg font-bold tracking-tight">Spot</h1>
      </header>

      {/* Área scrollable centrada y limitada a ~400px como en el mockup móvil; animación de entrada fade-in. */}
      <main className="spot-usage-screen-enter mx-auto w-full max-w-[400px] flex-1 px-5 pb-32 pt-6">
        {/* Bloque de títulos: pregunta principal + subtítulo + microcopy social proof */}
        <div className="text-center">
          {/* Pregunta hero del flujo de onboarding */}
          <h2 className="text-[1.65rem] font-bold leading-tight tracking-tight text-neutral-900">
            ¿Cómo querés usar Spot?
          </h2>
          {/* Subtítulo que guía a elegir una de las dos tarjetas */}
          <p className="mt-2 text-sm text-neutral-500">Elegí una opción para continuar</p>
          {/* Texto pequeño y sutil: refuerzo de confianza / comunidad */}
          <p className="mt-4 text-xs font-medium text-neutral-400">+2.000 bares activos cerca tuyo</p>
        </div>

        {/* Lista vertical de tarjetas con espacio uniforme entre ellas */}
        <div className="mt-10 flex flex-col gap-4">
          {options.map((option) => (
            <UsageOptionCard
              key={option.id} // Key estable para reconciliación de React en listas
              optionId={option.id} // Identifica la opción al hacer clic
              title={option.title} // Título en negrita dentro de la card
              description={option.description} // Descripción gris
              selected={selectedOption === option.id} // Calcula si esta fila es la seleccionada
              onSelect={setSelectedOption} // Actualiza useState con el id pulsado
              icon={option.icon} // Pasa el componente Compass o Store
              exploreVariant={option.exploreVariant} // Alterna estilo de ícono explorar vs publicar
              disabled={loading} // Evita cambiar opción mientras continuar está procesando
            />
          ))}
        </div>

        {/* Mensaje de error inline si falla asignarRol */}
        {error ? (
          <p className="mt-6 text-center text-sm font-medium text-red-600" role="alert">
            {error}
          </p>
        ) : null}
      </main>

      {/* Barra inferior fija: botón ancho completo con safe-area para iPhone */}
      <footer className="fixed bottom-0 left-0 right-0 z-10 border-t border-transparent bg-[#f7f7f7]/95 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-sm">
        <div className="mx-auto w-full max-w-[400px]">
          {/* Continuar: deshabilitado sin selección o durante loading; estilo pill negro con flecha */}
          <button
            type="button"
            onClick={handleContinue}
            disabled={!selected || loading}
            className={[
              "flex h-14 w-full items-center justify-center rounded-full text-base font-semibold text-white transition-all duration-300",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-2",
              !selected || loading
                ? "cursor-not-allowed bg-black opacity-40 shadow-none"
                : "cursor-pointer bg-black opacity-100 shadow-md hover:scale-[1.02] hover:shadow-lg active:scale-[0.99]",
            ].join(" ")}
          >
            {loading ? "Guardando..." : "Continuar →"}
          </button>
        </div>
      </footer>
    </div>
  )
}
