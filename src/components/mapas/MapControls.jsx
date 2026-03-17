import { useMap } from "react-leaflet"
import { Plus, Minus, Crosshair } from "lucide-react"

export default function MapControls({ userPosition }) {

  const map = useMap()

  const zoomIn = () => map.zoomIn()

  const zoomOut = () => map.zoomOut()

  const centerUser = () => {
    if (!userPosition) return
    map.setView(userPosition, 16)
  }

  return (
    <div className="absolute right-4 bottom-80 flex flex-col gap-3 z-[1000]">

      <button
        onClick={zoomIn}
        className="bg-black/70 backdrop-blur p-3 rounded-xl text-white"
      >
        <Plus size={20} />
      </button>

      <button
        onClick={zoomOut}
        className="bg-black/70 backdrop-blur p-3 rounded-xl text-white"
      >
        <Minus size={20} />
      </button>

      <button
        onClick={centerUser}
        className="bg-cyan-500 p-3 rounded-xl text-white"
      >
        <Crosshair size={20} />
      </button>

    </div>
  )
}
