// Neon Lounge BottomNav component.
// Renderiza navegación inferior con 5 ítems y estado activo (solo UI, sin lógica compleja).

import {
  Grid3X3,
  Store,
  Tag,
  Star,
  User,
} from "lucide-react"

const items = [
  { id: "dashboard", label: "Dashboard", icon: Grid3X3 },
  { id: "local", label: "Mi local", icon: Store },
  { id: "promos", label: "Promos", icon: Tag },
  { id: "reviews", label: "Reseñas", icon: Star },
  { id: "perfil", label: "Perfil", icon: User },
]

export default function BottomNav({ active = "dashboard", onChange }) {
  return (
    <nav className="neon-bottom-nav" aria-label="Navegación principal">
      <div className="flex items-center justify-evenly px-2 py-1">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = item.id === active
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange?.(item.id)}
              className={`neon-bottom-item ${isActive ? "neon-bottom-item--active" : ""}`}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon size={22} strokeWidth={isActive ? 2.3 : 1.9} className={isActive ? "drop-shadow-[0_0_12px_rgba(0,209,255,0.55)]" : ""} />
              <span className="text-[0.65rem] font-medium tracking-wide">{item.label}</span>
              {isActive ? <span className="neon-nav-dot" aria-hidden /> : <span className="h-1 w-1" aria-hidden />}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

