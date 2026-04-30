import { useMap } from "react-map-gl/maplibre"
import { Crosshair } from "lucide-react"
import { NavigationControl } from "react-map-gl/maplibre"
import { cn } from "@/lib/utils"

export default function MapControls({ userPosition, detailCardOpen = false }) {

  const map = useMap()
  // Cuando hay card del bar abierta, ocultamos COMPLETAMENTE los controles/compass.
  if (detailCardOpen) return null
  /* 
    const zoomIn = () => map.zoomIn()
  
    const zoomOut = () => map.zoomOut() */

  const centerUser = () => {

    if (!map.current || !userPosition) return

    map.current.flyTo({
      center: [userPosition[1], userPosition[0]], // [lng, lat]
      zoom: 16,
      speed: 1.2,
      essential: true,
    })
  }

  return (
    <div
      className={cn(
        "absolute right-2 z-[1000] flex flex-col gap-3 transition-[bottom] duration-200 ease-out",
        "bottom-[96px]"
      )}
    >
      <NavigationControl position="bottom-right" showCompass={true} />
      <button
        type="button"
        onClick={centerUser}
        className={cn(
          "rounded-xl border border-white/25 bg-[#141820] p-2 text-slate-200 shadow-[0_8px_18px_rgba(0,0,0,0.28)]",
          "transition-all duration-200 hover:scale-[1.02] hover:bg-[#1a202a] hover:text-white hover:shadow-[0_10px_22px_rgba(0,0,0,0.35)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300/70",
          "disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:scale-100"
        )}
        aria-label="Centrar en mi ubicacion"
        disabled={!userPosition}
      >
        <Crosshair size={20} />
      </button>

    </div>
  )
}
