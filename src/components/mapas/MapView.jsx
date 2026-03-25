import { MapContainer, TileLayer } from "react-leaflet"
import MapMarkers from "./MapMarkers"
import MapControls from "./MapControls"
import useDistanceTracker from "../../hooks/ejecutarNegociosCercanos"
import L from "leaflet"




export default function MapView({ bars, positionUser }) {

  const userIcon = new L.DivIcon({
    html: `
      <div class="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-md text-xl">
        🧭
      </div>
    `,
    className: "",
  })

  useDistanceTracker((meters) => {
    alert(`Caminaste ${Math.round(meters)} metros, revisa los negocios cercanos!`)
  }, 100)


  const barIcon = new L.DivIcon({
    html: `
      <div class="relative w-10 h-10 flex items-center justify-center">
        <div class="absolute inset-0 rounded-full bg-cyan-500/25 border border-cyan-200/60 animate-pulse"></div>
        <div class="relative w-10 h-10 rounded-full bg-cyan-500/75 flex items-center justify-center shadow-md animate-[pulse_2.2s_ease-in-out_infinite]">
          <span class="text-lg">🍸</span>
        </div>
      </div>
    `,
    className: "",
  })


  if (!positionUser) return <div className="h-screen w-full flex items-center justify-center">Cargando GPS...</div>
  return (
    <MapContainer
      center={positionUser || [-31.42, -64.18]}
      zoom={14}
      zoomControl={false}
      className="h-full  w-full z-0"
    >
      <TileLayer
        attribution="Spot"
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
         opacity={1}
         
      />

      {/* Usuario */}
      <MapMarkers position={positionUser} text="Aqui estas" icon={userIcon} />

      {Array.isArray(bars) && bars.map(bar => {
        const lat = Number(bar.lat ?? bar.Lat)
        const lng = Number(bar.lng ?? bar.Lng)
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
