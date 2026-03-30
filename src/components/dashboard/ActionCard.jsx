// Neon Lounge ActionCard component.
// Botón grande tipo card con ícono, título, subtexto y chevron.

import { ChevronRight } from "lucide-react"
import { hexToRgbTuple } from "./neonUtils"

export default function ActionCard({ title, subtitle, accentHex, icon: Icon }) {
  const accentRgb = hexToRgbTuple(accentHex)

  return (
    <button
      type="button"
      className="neon-action text-left"
      style={{ ["--accent-rgb"]: accentRgb }}
      aria-label={title}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="neon-action-icon shrink-0">
            <Icon size={20} strokeWidth={2.2} className="text-[#7eefff]" aria-hidden />
          </div>

          <div className="min-w-0">
            <div className="neon-action-title truncate">{title}</div>
            <div className="neon-action-subtitle mt-1 line-clamp-2">{subtitle}</div>
          </div>
        </div>

        <ChevronRight size={18} strokeWidth={2.2} className="text-[rgba(233,251,255,0.75)]" aria-hidden />
      </div>
    </button>
  )
}

