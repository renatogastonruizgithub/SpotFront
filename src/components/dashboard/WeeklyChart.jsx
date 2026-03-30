// Neon Lounge WeeklyChart component.
// Muestra el bloque "Actividad Semanal" con botón "Ver detalles →" y un gráfico de barras (mock).

import { ArrowRight } from "lucide-react"
import { hexToRgbTuple } from "./neonUtils"

export default function WeeklyChart({ accentHex = "#00D1FF" }) {
  const accentRgb = hexToRgbTuple(accentHex)

  // Mock visual (no usa librerías pesadas).
  const bars = [26, 38, 46, 62, 44, 50, 36]
  const activeIndex = 3

  return (
    <section className="mt-6">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[1.05rem] font-semibold tracking-[-0.01em]">Actividad Semanal</h3>
        <button
          type="button"
          className="flex items-center gap-2 rounded-full px-3 py-2 text-[0.9rem] font-semibold"
          style={{ color: accentHex, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.10)" }}
          aria-label="Ver detalles de la actividad semanal"
        >
          <span>Ver detalles</span>
          <ArrowRight size={16} />
        </button>
      </div>

      <div
        className="neon-glass neon-chart-wrap mt-3 neon-chart-in"
        style={{ ["--accent-rgb"]: accentRgb }}
      >
        <div className="neon-bars" role="img" aria-label="Gráfico de barras de actividad semanal">
          {bars.map((h, idx) => {
            const isActive = idx === activeIndex
            return (
              <div
                key={idx}
                className={`neon-bar ${isActive ? "neon-bar--active" : ""}`}
                style={{
                  height: `${h}%`,
                }}
              />
            )
          })}
        </div>
      </div>
    </section>
  )
}

