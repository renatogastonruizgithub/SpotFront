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
                "flex flex-col gap-1 h-auto py-2  text-xs",
                isActive
                  ? "text-cyan-400"
                  : "text-gray-400 hover:text-white"
              )}
            >
              <Icon
                size={22}
                className={cn(
                  isActive && "drop-shadow-[0_0_6px_#22d3ee]"
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