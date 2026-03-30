// Neon Lounge StatsCard component.
// Tarjeta glass con glow y acento por color para métricas del dashboard.

import { hexToRgbTuple } from "./neonUtils"

export default function StatsCard({ title, value, delta, accentHex, icon: Icon }) {
  const accentRgb = hexToRgbTuple(accentHex)

  return (
    <article
      className="neon-stats-card neon-glass"
      style={{ ["--accent-rgb"]: accentRgb }}
      aria-label={title}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[0.76rem] font-semibold tracking-[0.12em] text-[rgba(233,251,255,0.65)]">
            {title}
          </div>
          <div className="mt-2 text-[2rem] leading-none neon-stats-value">{value}</div>
          <div className="mt-2 text-[0.86rem] font-medium neon-delta">{delta}</div>
        </div>

        <div className="shrink-0">
          <Icon size={20} strokeWidth={2.2} className="neon-stats-icon" aria-hidden />
        </div>
      </div>
    </article>
  )
}

