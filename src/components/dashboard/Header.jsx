// Neon Lounge Header component.
// Renderiza: título del lugar, badge "SPOT VERIFIED", saludo y acciones (notificación/config).

import { Bell, Settings } from "lucide-react"

export default function Header() {
  return (
    <header className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <h1 className="text-[1.35rem] font-bold tracking-[-0.02em]">Neon Lounge</h1>

          <div className="neon-pill text-[0.78rem] font-semibold text-[#7eefff]">
            <span
              aria-hidden
              className="inline-block h-[10px] w-[10px] rounded-full"
              style={{ background: "rgba(0, 209, 255, 0.9)", boxShadow: "0 0 16px rgba(0,209,255,.6)" }}
            />
            <span>SPOT VERIFIED</span>
          </div>
        </div>

        <div className="mt-4">
          <h2 className="text-[1.2rem] font-semibold tracking-[-0.02em]">
            ¡Hola, Alex! <span aria-hidden>👋</span>
          </h2>
          <p className="mt-1 text-[0.95rem] leading-relaxed text-[rgba(233,251,255,0.78)]">
            Tu bar está teniendo un gran impacto hoy.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button type="button" className="neon-circle-btn" aria-label="Notificaciones">
          <Bell size={20} className="text-[#7eefff]" />
        </button>
        <button type="button" className="neon-circle-btn" aria-label="Configuración">
          <Settings size={20} className="text-[#7eefff]" />
        </button>
      </div>
    </header>
  )
}

