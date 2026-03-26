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
        onClick={centerUser}
        className="rounded-xl bg-[#00D1FF] p-2 text-white shadow-md shadow-[#00D1FF]/25 transition-colors hover:bg-[#33d9ff]"
      >
        <Crosshair size={20} />
      </button>

    </div>
  )
}
