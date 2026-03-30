import { MapPin, Star, X, Users } from "lucide-react"
import { useMemo, useState } from "react"
import { formatDistanceFromUser } from "@/lib/geo"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const PLACEHOLDER_IMG =
  "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=1200&h=800&fit=crop"

function normalizeNumber(v, fallback) {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

function ambienteTier(bar) {
  const raw = String(bar?.ambiente ?? bar?.vibra ?? "").toLowerCase()
  const isTranquilo =
    raw.includes("tran") || raw.includes("chill") || raw.includes("suave")
  const isMedio = raw.includes("medio") || raw.includes("moder") || raw.includes("mix")

  if (isTranquilo) return { label: "Tranqui", emoji: "🟢", accent: "from-emerald-400/80 to-[#00D1FF]/0" }
  if (isMedio) return { label: "Medio", emoji: "🟡", accent: "from-amber-300/80 to-[#00D1FF]/0" }
  return { label: "Explotado ahora", emoji: "🔥", accent: "from-violet-400/80 to-[#00D1FF]/0" }
}

function estimatePeopleNow(bar, ratingFallback) {
  // Si el back ya manda campos de gente, conectarlos acá.
  // Para que la UI no quede vacía: estimación demo basada en rating.
  const rating = normalizeNumber(bar?.rating ?? bar?.estrellas ?? ratingFallback, ratingFallback)
  const intensity = Math.min(1, Math.max(0, rating / 5))
  return Math.round(80 + intensity * 90) // 80..170
}

function getPromoList(bar) {
  const out = []
  const promo1 = bar?.promo ?? bar?.promo_text
  const promo2 = bar?.promo2 ?? bar?.promo_text2

  if (promo1) out.push(`🍹 ${promo1}`)
  if (promo2) out.push(`🎟️ ${promo2}`)

  // Fallback demo
  if (out.length < 2) out.push("🍹 2x1 en tragos hasta las 02:00")
  if (out.length < 2) out.push("🎟️ Entrada gratis mujeres")

  return out.slice(0, 2)
}

function parsePromoItem(text) {
  const s = String(text ?? "").trim()
  if (!s) return { emoji: "🎉", text: "" }
  const firstSpace = s.indexOf(" ")
  if (firstSpace <= 0) return { emoji: "🎉", text: s }
  return { emoji: s.slice(0, firstSpace), text: s.slice(firstSpace + 1).trim() }
}

export default function BarDetailsScreen({
  bar,
  distanceMeters,
  onClose,
  onNavigate,
}) {
  const [saved, setSaved] = useState(() => {
    try {
      return bar?.id_negocio
        ? localStorage.getItem(`spot_saved_${bar.id_negocio}`) === "1"
        : false
    } catch {
      return false
    }
  })
  const [checkinPoints, setCheckinPoints] = useState(() => {
    try {
      return bar?.id_negocio ? Number(localStorage.getItem(`spot_points_${bar.id_negocio}`) ?? 0) : 0
    } catch {
      return 0
    }
  })

  const tier = useMemo(() => ambienteTier(bar), [bar])
  const peopleNow = useMemo(() => estimatePeopleNow(bar, 4.5), [bar])
  const promoList = useMemo(() => getPromoList(bar), [bar])

  const music = bar?.musica ?? bar?.music ?? "Reggaeton"
  const priceTier = bar?.precio ?? bar?.precio_promedio ?? ""
  const priceLabel =
    String(priceTier).toLowerCase().includes("eco") || priceTier === "1"
      ? "Económico"
      : String(priceTier).toLowerCase().includes("car") || priceTier === "3"
        ? "Caro"
        : "Medio"

  const handleToggleSaved = () => {
    const next = !saved
    setSaved(next)
    try {
      if (bar?.id_negocio) localStorage.setItem(`spot_saved_${bar.id_negocio}`, next ? "1" : "0")
    } catch {}
  }

  const handleCheckin = () => {
    // Gamificación simple: suma puntos una vez por click.
    const next = checkinPoints + 10
    setCheckinPoints(next)
    try {
      if (bar?.id_negocio) localStorage.setItem(`spot_points_${bar.id_negocio}`, String(next))
    } catch {}
  }

  if (!bar) return null

  const headerImg = bar?.img_foto_actual || bar?.img_fachada || bar?.image || PLACEHOLDER_IMG
  const distLabelRaw = distanceMeters ? formatDistanceFromUser(distanceMeters) : ""
  const distLabel = distLabelRaw ? distLabelRaw.replace(" m", "m") : "A —"

  const handleClose = () => onClose?.()

  return (
    <div
      className="fixed inset-0 z-[1001] bg-black/70 backdrop-blur-sm animate-[spot-sheet-in_220ms_ease-out] flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-[430px] h-[92dvh] sm:h-[88vh] rounded-3xl overflow-hidden border border-white/10 shadow-[0_25px_90px_rgba(0,0,0,0.7)] bg-[#0b0f14]">
        {/* HEADER */}
        <div className="relative h-[280px] sm:h-[300px]">
          <img src={headerImg} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f14]/95 via-black/30 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,209,255,0.20),transparent_58%)]" />

          <button
            type="button"
            onClick={handleClose}
            className="absolute right-3 top-3 z-10 rounded-xl bg-black/35 p-2 text-white/90 ring-1 ring-white/10 hover:bg-black/55"
            aria-label="Cerrar"
          >
            <X size={18} strokeWidth={2.5} />
          </button>

          <div className="absolute left-5 right-5 bottom-4 z-10">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <span className="text-[22px]" aria-hidden>
                    🍸
                  </span>
                  <h2 className="text-white font-black text-[28px] leading-[1.05] drop-shadow">
                    {bar?.razon_social ?? "Spot"}
                  </h2>
                </div>
              </div>

              {/* Live status pill */}
              <div className="shrink-0">
                <div
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full backdrop-blur-md border px-3 py-2",
                    tier.label.includes("Explotado")
                      ? "bg-violet-500/15 border-violet-400/30"
                      : tier.label === "Medio"
                        ? "bg-amber-300/12 border-amber-300/25"
                        : "bg-[#00D1FF]/12 border-[#00D1FF]/25"
                  )}
                >
                  <span className="text-[15px]" aria-hidden>
                    {tier.emoji}
                  </span>
                  <span className="text-white/95 font-black text-[13px]">{tier.label}</span>
                </div>
              </div>
            </div>

            {/* Quick live metrics */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-black/35 backdrop-blur-md border border-white/10 px-3 py-2 text-white/90">
                <Users className="size-4 text-[#7eefff]" />
              <span className="text-[13px] font-semibold">{peopleNow} ahora</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-black/35 backdrop-blur-md border border-white/10 px-3 py-2 text-white/90">
                <MapPin className="size-4 text-[#7eefff]" />
                <span className="text-[13px] font-semibold">{distLabel}</span>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="h-[calc(92dvh-280px)] sm:h-[calc(88vh-300px)] overflow-y-auto px-5 pb-6 spot-details-scroll">
          {/* ACTION BUTTONS */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onNavigate}
              className="rounded-2xl bg-black/25 border border-white/10 backdrop-blur px-3 py-3 text-white/95 flex items-center justify-center gap-2 hover:bg-black/40 transition-colors"
            >
              <MapPin className="size-5 text-[#7eefff]" />
              <span className="text-[13px] font-black">Cómo llegar</span>
            </button>

            <button
              type="button"
              onClick={handleToggleSaved}
              className={cn(
                "rounded-2xl border px-3 py-3 backdrop-blur flex items-center justify-center gap-2 transition-colors",
                saved
                  ? "bg-[#FFC107]/10 border-[#FFC107]/35"
                  : "bg-black/25 border-white/10 hover:bg-black/40"
              )}
            >
              <Star
                className={cn("size-5", saved ? "text-[#FFC107]" : "text-white/80")}
                fill={saved ? "#FFC107" : "transparent"}
              />
              <span className="text-[13px] font-black">{saved ? "Guardado" : "Guardar"}</span>
            </button>

            {/* sin CTA principal 'Voy ahora' (según pedido) */}
          </div>

          {/* INFO RAPIDA */}
          <div className="mt-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <div className="text-white/60 text-[12px] font-semibold flex items-center gap-2">
                  <span aria-hidden>🎧</span> Música
                </div>
                <div className="mt-2 text-white font-black text-[14px]">{music}</div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <div className="text-white/60 text-[12px] font-semibold flex items-center gap-2">
                  <span aria-hidden>💸</span> Precio
                </div>
                <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-[#00D1FF]/12 border border-[#00D1FF]/25 px-3 py-1.5">
                  <span className="text-[#7eefff] font-black text-[13px]">{priceLabel}</span>
                </div>
              </div>

              <div className="col-span-2 rounded-2xl border border-white/10 bg-black/20 p-3">
                <div className="text-white/60 text-[12px] font-semibold flex items-center gap-2">
                  <span aria-hidden>🕒</span> Horarios
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full bg-black/30 border border-white/10 px-3 py-1.5 text-white/90 text-[13px] font-semibold">
                    <span aria-hidden>🌙</span> Cierra {bar?.hora_cierre ?? bar?.horaCierre ?? bar?.cierre ?? "06:00"}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* PROMOS */}
          <div className="mt-5">
            <div className="text-white font-black text-[14px] mb-3">Promos activas</div>
            <div className="grid grid-cols-1 gap-3">
              {promoList.map((p, idx) => {
                const parsed = parsePromoItem(p)
                return (
                  <div
                    key={`${parsed.emoji}_${idx}`}
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 flex items-center gap-3"
                  >
                    <div className="w-11 h-11 rounded-2xl bg-[#00D1FF]/12 border border-[#00D1FF]/25 flex items-center justify-center text-[20px]">
                      {parsed.emoji}
                    </div>
                    <div className="min-w-0">
                      <div className="text-white font-black text-[13px] leading-tight">{parsed.text}</div>
                      <div className="text-white/50 text-[12px] mt-1">Hoy puede terminarse rápido</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* CHECK-IN */}
          <div className="mt-5">
            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-white font-black text-[14px]">Check-in</div>
                  <div className="text-white/60 text-[12px] mt-1">Sumá puntos y desbloqueá beneficios</div>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[#7c3aed]/10 border border-[#7c3aed]/25 px-3 py-1.5">
                  <span aria-hidden>⭐</span>
                  <span className="text-[#d8b4fe] font-black text-[12px]">{checkinPoints} pts</span>
                </div>
              </div>

              <Button
                type="button"
                onClick={handleCheckin}
                className="mt-3 w-full h-[52px] rounded-2xl bg-[#7c3aed]/25 border border-[#7c3aed]/35 text-white font-black hover:bg-[#7c3aed]/30 shadow-[0_0_26px_rgba(124,58,237,0.25)]"
              >
                <span className="inline-flex items-center justify-center gap-2 text-[14px]">
                  <span aria-hidden>📍</span> Estoy acá
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

