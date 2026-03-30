import { Star, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const PLACEHOLDER_IMG =
  "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=1200&h=800&fit=crop"

function clampNumber(value, fallback, min, max) {
  const n = Number(value)
  if (!Number.isFinite(n)) return fallback
  return Math.min(max, Math.max(min, n))
}

function StarsRow({ rating }) {
  const r = clampNumber(rating, 4.5, 0, 5)
  const filledCount = Math.round(r)
  return (
    <div
      className="flex shrink-0 items-center gap-0.5 text-[#FFC107]"
      aria-label={`${r} de 5 estrellas`}
    >
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < filledCount
        return (
          <Star
            key={i}
            size={13}
            className={cn(filled && "fill-[#FFC107]")}
            strokeWidth={filled ? 0 : 1.5}
          />
        )
      })}
    </div>
  )
}

/**
 * Devuelve el estado de abierto/cerrado con microcopy + emoji.
 * Cuando el back tenga datos reales (cerrado/hora_cierre), estos campos van a mandar.
 */
export function openStatusLabel(bar) {
  if (bar?.cerrado === true) {
    return { abierto: false, emoji: "🔴", linea: "Cerrado · Probá otro" }
  }
  if (bar?.hora_cierre) {
    return { abierto: true, emoji: "🟢", linea: `Abierto · Hasta ${bar.hora_cierre}` }
  }

  // Demo fallback: horario local (ajustable)
  const h = new Date().getHours()
  const abierto = h >= 11 || h < 3
  return {
    abierto,
    emoji: abierto ? "🟢" : "🔴",
    linea: abierto ? "Abierto " : "Cerrado ",
  }
}

function ambienteTier(ambienteRaw) {
  const s = String(ambienteRaw ?? "").toLowerCase()
  const isTranquilo = s.includes("tran") || s.includes("chill") || s.includes("suave")
  const isMedio = s.includes("medio") || s.includes("moder") || s.includes("mix")

  if (isTranquilo) return { label: "Tranqui", emoji: "🟢" }
  if (isMedio) return { label: "Medio", emoji: "🟡" }
  return { label: "Explotado ahora", emoji: "🔥" }
}

function getPeopleNow(bar, ratingFallback) {
  // Si no tenés campos reales, generamos una estimación demo con rating/distancia (para no romper la UI).
  const rating = clampNumber(bar?.rating ?? bar?.estrellas ?? ratingFallback, ratingFallback, 0, 5)
  const distMeters = bar?._distMeters
  const proximity = Number.isFinite(distMeters) ? distMeters : 900
  const closerBoost = Math.max(0, 1200 - proximity) / 1200 // 0..1
  const base = 60 + rating * 25 // 60..185
  return Math.round(base * (0.6 + closerBoost * 0.8)) // 36..335
}

function getPeopleEntering(bar, peopleNow) {
  const enteringRaw = bar?.people_entering ?? bar?.entrando ?? bar?.entrantes
  const n = Number(enteringRaw)
  if (Number.isFinite(n)) return Math.max(0, Math.round(n))
  // Demo: 15% a 30% del total actual (según intensidad)
  const ratio = bar?.ambiente?.toString?.().toLowerCase?.().includes?.("tran") ? 0.12 : 0.22
  return Math.round(peopleNow * ratio)
}

function getTags(bar) {
  // 1) tags existentes en back (si existen)
  if (Array.isArray(bar?.tags)) return bar.tags.slice(0, 3).filter(Boolean)
  // 2) dos tags tipo tag1/tag2
  const t1 = bar?.tag1 ?? bar?.tag_1
  const t2 = bar?.tag2 ?? bar?.tag_2
  const out = []
  if (t1) out.push(t1)
  if (t2) out.push(t2)
  // 3) fallback demo
  if (out.length < 3) out.push("Reggaeton")
  if (out.length < 3) out.push("Económico")
  if (out.length < 3) out.push("Bailar")
  return out.slice(0, 3)
}

function getPromo(bar, meters) {
  const promoRaw = bar?.promo ?? bar?.promo_text
  if (promoRaw) return promoRaw
  // Demo: promo cercana / lejana
  if (Number.isFinite(meters) && meters <= 1500) return "2x1 hasta 02:00"
  return "Promo de la noche"
}

export default function BarBottomCard({
  bar,
  distanceMeters,
  onClose = () => {},
  onVerDetalles,
  className,
}) {
  if (!bar) return null

  const title = bar?.razon_social ?? "Neon Lounge Club"
  const imgSrc = bar?.img_foto_actual ?? bar?.img_fachada ?? bar?.image ?? PLACEHOLDER_IMG

  const ratingRaw = bar?.rating ?? bar?.estrellas ?? 4.9
  const rating = Number(ratingRaw)
  const ratingText = Number.isFinite(rating) ? rating.toFixed(1) : "4.9"

  const meters = distanceMeters ?? null
  const distText =
    meters == null || !Number.isFinite(Number(meters))
      ? "1.2 km"
      : Number(meters) < 1000
        ? `${Math.round(Number(meters))} m`
        : `${(Number(meters) / 1000).toFixed(1)} km`

  const closing = bar?.hora_cierre ?? bar?.horaCierre ?? bar?.cierre ?? "06:00"

  return (
    <div
      className={cn(
        "relative rounded-3xl overflow-hidden border border-white/10 bg-[#0b0f14]/60",
        "backdrop-blur-md shadow-[0_25px_90px_rgba(0,0,0,0.65)]",
        "w-full max-w-[430px] mx-auto",
        "animate-[spot-sheet-in_220ms_ease-out]",
        // Evita altura fija: usa aspect ratio para que el alto se ajuste al ancho
        "aspect-[16/9]",
        className
      )}
      role="dialog"
      aria-label={`Spot - ${title}`}
    >
      {/* Close (X) arriba derecha */}
      <button
        type="button"
        onClick={onClose}
        className="absolute right-3 top-3 z-10 rounded-xl bg-black/35 p-2 text-white/90 ring-1 ring-white/10 hover:bg-black/55"
        aria-label="Cerrar"
      >
        <X size={18} strokeWidth={2.5} />
      </button>

      {/* FONDO (IMAGEN FULL) */}
      <img src={imgSrc} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />

      {/* OVERLAY DARK (DE ABAJO HACIA ARRIBA) */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f14]/95 via-black/45 to-black/10" />

      {/* CONTENIDO SUPERPUESTO */}
      <div className="absolute inset-0 p-5 flex flex-col">
        {/* PARTE SUPERIOR IZQUIERDA: Badge de rating */}
        <div className="flex justify-start">
          <div className="inline-flex items-center gap-2 rounded-full bg-black/35 backdrop-blur-md border border-white/10 px-4 py-2 text-white/90 font-black shadow-[0_0_25px_rgba(0,209,255,0.15)]">
            <span className="text-[#FFC107] text-[14px] leading-none" aria-hidden>
              ⭐
            </span>
            <span className="text-[14px] leading-none">{ratingText}</span>
          </div>
        </div>

        {/* CENTRO IZQUIERDA: Nombre del bar */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="flex items-center gap-3">
            <span className="text-[22px] drop-shadow" aria-hidden>
              🍸
            </span>
            <h3 className="text-white font-black text-[26px] leading-[1.02] drop-shadow">{title}</h3>
          </div>

          {/* DEBAJO DEL NOMBRE: Badges horizontales */}
          <div className="mt-4 flex gap-3">
            <div className="flex-1 rounded-full bg-[#00D1FF]/18 border border-[#00D1FF]/40 px-4 py-2 text-[12px] font-black text-[#7eefff] inline-flex items-center justify-center shadow-[0_0_18px_rgba(0,209,255,0.25)]">
              🔥 2x1 GIN TONIC
            </div>
            <div className="flex-1 rounded-full bg-violet-500/15 border border-violet-400/35 px-4 py-2 text-[12px] font-black text-[#d8b4fe] inline-flex items-center justify-center shadow-[0_0_18px_rgba(139,92,246,0.25)]">
              🎶 MÚSICA LIVE
            </div>
          </div>
        </div>

        {/* PARTE INFERIOR */}
        <div className="flex items-end justify-between gap-4 pb-1">
          {/* Inferior izquierda: distancia + cierre */}
          <div className="flex flex-col gap-2">
            <div className="inline-flex items-center gap-2 text-white/85 text-[13px] font-semibold">
              <span aria-hidden>📍</span>
              <span>{distText}</span>
            </div>
            <div className="inline-flex items-center gap-2 text-white/85 text-[13px] font-semibold">
              <span aria-hidden>🕒</span>
              <span>Cierra {closing}</span>
            </div>
          </div>

          {/* CTA (inferior derecha) */}
          <Button
            type="button"
            onClick={onVerDetalles}
            className="h-[48px] px-7 rounded-2xl bg-[#00D1FF] text-[#0b0f14] font-black shadow-[0_0_22px_rgba(0,209,255,0.35)] hover:bg-[#33d9ff] transition-colors whitespace-nowrap"
          >
            <span className="inline-flex items-center justify-center gap-2 text-[13px]">
              <span aria-hidden>👉</span> Entrar al bar
            </span>
          </Button>
        </div>
      </div>
    </div>
  )
}
