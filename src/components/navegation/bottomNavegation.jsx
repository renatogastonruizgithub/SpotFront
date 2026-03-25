import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import {
  Compass,
  Map,
  Tag,
  Calendar,
  User
} from "lucide-react"

const items = [
  { id: "explore", label: "Explorar", icon: Compass },
  { id: "map", label: "Mapa", icon: Map },
  { id: "promos", label: "Promos", icon: Tag },
  { id: "reservas", label: "Reservas", icon: Calendar },
  { id: "perfil", label: "Perfil", icon: User }
]

export default function BottomNav({ active = "map", onChange }) {
  return (
    <nav
      className="
      fixed bottom-0 left-0 right-0
      w-full
      bg-[#0b0f14]
      border-t border-white/5
      backdrop-blur z-[999]
      "
    >
      <div className="flex items-center justify-between px-2 py-2">

        {items.map((item) => {
          const Icon = item.icon
          const isActive = active === item.id

          return (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => onChange?.(item.id)}
              className={cn(
                "group relative flex h-auto flex-col gap-1 rounded-xl px-1.5 py-2 text-xs",
                "transition-[color,transform,box-shadow,background-color] duration-200 ease-out",
                "focus-visible:ring-2 focus-visible:ring-cyan-500/40",
                isActive
                  ? "text-cyan-400 hover:bg-cyan-500/10"
                  : [
                      "text-gray-400",
                      "hover:bg-cyan-500/[0.07] hover:text-cyan-200",
                      "hover:shadow-[inset_0_0_0_1px_rgba(34,211,238,0.12)]",
                      "active:scale-[0.97]",
                    ]
              )}
            >
              <Icon
                size={22}
                className={cn(
                  "transition-[transform,filter,color] duration-200 ease-out",
                  isActive && "drop-shadow-[0_0_6px_#22d3ee]",
                  !isActive &&
                    "group-hover:scale-110 group-hover:text-cyan-300 group-hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.35)]"
                )}
              />

              <span>{item.label}</span>

              {isActive && (
                <div className="w-1 h-1 rounded-full bg-cyan-400 mt-1" />
              )}
            </Button>
          )
        })}
      </div>
    </nav>
  )
}