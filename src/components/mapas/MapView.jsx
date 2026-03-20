import { MapContainer, TileLayer } from "react-leaflet"
import MapMarkers from "./MapMarkers"
import MapControls from "./MapControls"

import L from "leaflet"




export default function MapView({ bars, positionUser }) {

  const userIcon = new L.DivIcon({
    html: "&#128102",
    className: "text-2xl",
  })



  const barIcon = new L.DivIcon({
    html: "🍺",
    className: "text-2xl",
  })


  if (!positionUser) return <div className="h-screen w-full flex items-center justify-center">Cargando GPS...</div>
  return (
    <MapContainer
      center={positionUser || [-31.42, -64.18]}
      zoom={14}
      zoomControl={false}
      className="h-screen w-full z-0"
    >
      <TileLayer
        attribution="Spot"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Usuario */}
      <MapMarkers position={positionUser} text="Aqui estas" icon={userIcon} />

      {Array.isArray(bars) && bars.map(bar => {
        const lat = Number(bar.lat)
        const lng = Number(bar.lng)
        if (isNaN(lat) || isNaN(lng)) return null
        
        return (
          <MapMarkers
            key={bar.id_negocio}
            position={[lat, lng]}
            icon={barIcon}
            text={`${bar.razon_social} - Distancia: ${bar.distancia}mts`} 
          />
        )
      })}



      <MapControls userPosition={positionUser} />
      
    </MapContainer>
  )
}
