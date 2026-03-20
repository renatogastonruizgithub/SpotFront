import { Marker, Popup } from "react-leaflet"
import L from "leaflet"

const iconBar = new L.DivIcon({
  html: "🍺",
  className: "text-2xl bg-cyan-500 rounded-full p-2",
})

export default function MapMarkers({position, icon ,text}) {
  return (
    <>
      <Marker position={position} icon={icon}>
        <Popup>{text}</Popup>
      </Marker>
    </>
  )
}
