import { Star, Navigation, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatDistanceFromUser } from "@/lib/geo"

const PLACEHOLDER_IMG =
  "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=240&h=240&fit=crop"

function StarsRow({ rating }) {
  const r = Math.min(5, Math.max(0, Number(rating) || 0))
  const filledCount = Math.round(r)
  return (
    <div className="flex shrink-0 items-center gap-0.5 text-amber-400" aria-label={`${r} de 5 estrellas`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < filledCount
        return (
          <Star
            key={i}
            size={13}
            className={cn(filled && "fill-amber-400")}
            strokeWidth={filled ? 0 : 1.5}
          />
        )
      })}
    </div>
  )
}

/** Heurística simple para demo; cuando el back envíe horarios reales, reemplazar. */
export function openStatusLabel(bar) {
  if (bar?.cerrado === true) return { abierto: false, linea: "Cerrado · Consultá horarios" }
  if (bar?.hora_cierre) {
    return { abierto: true, linea: `Abierto hasta ${bar.hora_cierre}` }
  }
  const h = new Date().getHours()
  const abierto = h >= 11 || h < 3
  return {
    abierto,
    linea: abierto ? "Abierto hasta 03:00" : "Cerrado · Abre 11:00",
  }
}

export default function BarBottomCard({
  bar,
  distanceMeters,
  onClose = () => {},
  onVerDetalles,
  onNavigate,
  className,
}) {
  if (!bar) return null

  const title = bar.razon_social ?? "Bar"
  const imgSrc = bar.img_fachada || bar.image || PLACEHOLDER_IMG
  const rating = bar.rating ?? bar.estrellas ?? 4.5
  const { linea: statusLine } = openStatusLabel(bar)
  const ambiente = bar.ambiente ?? bar.vibra ?? "CHILL VIBES"
  const promo = bar.promo ?? bar.promo_text

  return (
    <div
      className={cn(
        "relative rounded-2xl border border-white/10 bg-[#0b0f14]/95 backdrop-blur-md shadow-xl",
        "flex gap-3 p-3 pt-3 pr-3",
        className
      )}
      role="dialog"
      aria-label={`Detalle de ${title}`}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-2 right-2 z-10 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
        aria-label="Cerrar"
      >
        <X size={18} strokeWidth={2} />
      </button>

      <img
        src={imgSrc}
        alt=""
        className="h-[84px] w-[84px] shrink-0 rounded-xl object-cover"
        loading="lazy"
        onError={(e) => {
          e.currentTarget.src = PLACEHOLDER_IMG
        }}
      />

      <div className="flex min-w-0 flex-1 flex-col gap-1.5 pr-8">
        <div className="flex items-start justify-between gap-2">
          <h3 className="min-w-0 flex-1 truncate text-sm font-semibold text-white">{title}</h3>
          <StarsRow rating={rating} />
        </div>

        <p className="text-xs text-gray-400">
          {formatDistanceFromUser(distanceMeters)} · {statusLine}
        </p>

        <div className="flex flex-wrap gap-2">
          <span className="rounded-md border border-cyan-500/50 bg-cyan-500/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-cyan-300">
            {ambiente}
          </span>
          {promo ? (
            <span className="rounded-md border border-fuchsia-500/50 bg-fuchsia-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-fuchsia-300">
              Promo: {promo}
            </span>
          ) : null}
        </div>

        <div className="mt-auto flex gap-2 pt-1">
          <Button
            type="button"
            className="h-9 flex-1 rounded-xl bg-cyan-400 font-semibold text-[#0b0f14] hover:bg-cyan-300"
            onClick={onVerDetalles}
          >
            Ver promos →
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-10 shrink-0 rounded-xl border-cyan-500/40 bg-[#151a22] text-cyan-400 hover:bg-[#1a222c] hover:text-cyan-300"
            onClick={onNavigate}
            aria-label="Ir al bar: recorrido en el mapa"
            title="Recorrido en el mapa"
          >
            <Navigation className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
