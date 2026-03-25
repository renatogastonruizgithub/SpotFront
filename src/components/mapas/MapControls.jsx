import { useMap } from "react-map-gl/maplibre"
import { Plus, Minus, Crosshair } from "lucide-react"
import { NavigationControl } from "react-map-gl/maplibre"

export default function MapControls({ userPosition }) {

  const map = useMap()
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
    <div className="absolute right-2 bottom-100 flex flex-col gap-3 z-[1000]">

      <NavigationControl style={{position:"absolute",right:"2px" ,top:"10dvh"}} showCompass={true} />
      <button
        onClick={centerUser}
        className="bg-cyan-500 p-2 rounded-xl text-white"
      >
        <Crosshair size={20} />
      </button>

    </div>
  )
}
