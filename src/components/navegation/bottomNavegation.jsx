import { cn } from "@/lib/utils"
import { Map, Tag, User } from "lucide-react"

const items = [
  { id: "promos", label: "Promos", icon: Tag },
  { id: "map", label: "Mapa", icon: Map },
  { id: "perfil", label: "Perfil", icon: User },
]

export default function BottomNav({ active = "map", onChange }) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[999] w-full border-t border-black/10 bg-[#101216]/96 backdrop-blur-xl"
      style={{
        paddingBottom: "max(0.5rem, env(safe-area-inset-bottom, 0px))",
      }}
      aria-label="Navegación principal"
    >
      <div className="flex items-center justify-evenly px-2 py-2">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = active === item.id

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange?.(item.id)}
              className={cn(
                "group flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-1.5 py-1.5",
                "transition-[color,transform,background-color] duration-200 ease-out",
                "touch-manipulation outline-none focus-visible:ring-2 focus-visible:ring-slate-300/40",
                "active:scale-[0.97]",
                isActive
                  ? "bg-white/[0.06] text-slate-100 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                  : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-300"
              )}
            >
              <Icon
                size={22}
                strokeWidth={isActive ? 2.25 : 1.75}
                className={cn(
                  "transition-[transform,filter,color] duration-200",
                  isActive && "drop-shadow-[0_0_10px_rgba(255,255,255,0.25)]",
                  !isActive && "group-hover:scale-110 group-hover:text-slate-300"
                )}
                aria-hidden
              />
              <span className="max-w-[4.2rem] truncate text-[0.68rem] font-medium tracking-wide">
                {item.label}
              </span>
              {isActive ? (
                <span className="h-1 w-1 rounded-full bg-slate-200 shadow-[0_0_8px_rgba(255,255,255,0.55)]" aria-hidden />
              ) : (
                <span className="h-1 w-1 shrink-0" aria-hidden />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
