import { Check } from "lucide-react"

/**
 * Tarjeta seleccionable para elegir modo de uso (explorar / publicar bar).
 * Muestra ícono, título, descripción y estados visual/hover/selección con transiciones.
 */
export default function UsageOptionCard({
  optionId, // Identificador único de la opción ("explorar" | "publicar") para comparar con la selección actual
  title, // Texto principal en negrita de la tarjeta
  description, // Texto secundario gris debajo del título
  selected, // Boolean: true si esta tarjeta es la opción activa
  onSelect, // Callback al hacer clic; recibe optionId para actualizar el estado en el padre
  icon, // Componente de ícono de lucide-react a renderizar dentro del cuadrado
  exploreVariant, // Boolean: true = cuadrado negro con ícono blanco (Explorar); false = fondo gris claro (Publicar)
  disabled = false, // Bloquea interacción mientras el padre envía el rol al backend
}) {
  const IconComponent = icon // Alias con mayúscula para usar el ícono como componente React en JSX
  return (
    // Botón nativo accesible: role implícito, teclado y aria-pressed para lectores de pantalla
    <button
      type="button" // Evita submit accidental si el bloque estuviera dentro de un formulario
      onClick={() => onSelect(optionId)} // Notifica al padre qué opción eligió el usuario
      disabled={disabled} // Evita cambiar de opción durante la petición de asignación de rol
      aria-pressed={selected} // Indica a tecnologías asistivas si la opción está seleccionada
      className={[
        // Contenedor relativo para posicionar el check en la esquina superior derecha
        "group relative w-full rounded-2xl bg-white p-4 text-left transition-all duration-300",
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
        // Borde: visible y negro solo cuando está seleccionada; gris muy suave si no
        selected ? "border-2 border-black shadow-lg" : "border border-neutral-200/80 shadow-sm",
        // Escala ligera al seleccionar; sin selección, el hover sube la elevación
        selected ? "scale-105" : "hover:shadow-lg",
        // Anillo de foco visible para navegación por teclado
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/25 focus-visible:ring-offset-2",
      ].join(" ")}
    >
      {/* Check solo visible cuando la tarjeta está seleccionada */}
      {selected ? (
        <span
          className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-black text-white shadow-sm"
          aria-hidden // Decorativo; el estado ya está en aria-pressed del botón
        >
          <Check className="h-3.5 w-3.5 stroke-[3]" strokeWidth={3} />
        </span>
      ) : null}

      <div className="flex items-start gap-3 pr-6">
        {/* Contenedor del ícono: negro + blanco para explorar; gris claro + ícono oscuro para publicar */}
        <span
          className={[
            "inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors duration-300",
            exploreVariant ? "bg-black text-white" : "bg-neutral-200/90 text-neutral-900",
          ].join(" ")}
        >
          <IconComponent className="h-6 w-6" strokeWidth={2} aria-hidden />
        </span>

        <div className="min-w-0 flex-1">
          {/* Título en negrita */}
          <p className="text-base font-bold tracking-tight text-neutral-900">{title}</p>
          {/* Descripción secundaria */}
          <p className="mt-1 text-sm leading-snug text-neutral-500">{description}</p>
        </div>
      </div>
    </button>
  )
}
