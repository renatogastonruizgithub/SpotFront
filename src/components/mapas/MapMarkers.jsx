import { Marker, Popup } from "react-leaflet"
import L from "leaflet"

const iconBar = new L.DivIcon({
  html: `<div class="flex h-10 w-10 items-center justify-center rounded-full border border-[#7eefff]/55 bg-[#00D1FF]/88 text-lg text-white shadow-md shadow-[#00D1FF]/30 ring-1 ring-white/20">🍸</div>`,
  className: "bg-transparent border-0",
  iconSize: [40, 40],
  iconAnchor: [20, 20],
})

export default function MapMarkers({ position, icon, text }) {
  return (
    <>
      <Marker position={position} icon={icon ?? iconBar}>
        <Popup>{text}</Popup>
      </Marker>
    </>
  )
}
