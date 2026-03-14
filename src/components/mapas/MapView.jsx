import { MapContainer, TileLayer } from "react-leaflet"
import MapMarkers from "./MapMarkers"
import MapControls from "./MapControls"
import ubicacionUsuario from "../../hooks/obtenerUbicacionGps"
import { Marker, Popup } from "react-leaflet"
import useNegociosCercanos from "../../hooks/negociosCercanos"




export default function MapView() {

  const userIcon = new L.DivIcon({
    html: "&#128102",
    className: "text-2xl",
  })
  const bars = [
    {
      id: 1,
      name: "Cervecería Neón",
      lat: -31.442347284324768,
      lng: -64.1434824638745
    },  
    {
      id: 2,
      name: "Bar Centro",
      lat:   -31.443039595841256,
      lng:  -64.1483272142461
    }
  ]


  const barIcon = new L.DivIcon({
    html: "🍺",
    className: "text-2xl",
  })
  const positionUSer = ubicacionUsuario()

  const nearbyBars = useNegociosCercanos(positionUSer, bars, 500)

  if (!positionUSer) return <div>Cargando GPS...</div>
  return (
    <MapContainer
      center={positionUSer || [-31.42, -64.18]}
      zoom={14}
      zoomControl={false}
      className="h-screen w-full z-0"
    >
      <TileLayer
        attribution="Spot"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Usuario */}
      <MapMarkers position={positionUSer} text="Aqui estas" icon={userIcon} />


      {nearbyBars.map(bar => (
        <MapMarkers
          key={bar.id}
          position={[bar.lat, bar.lng]}
          icon={barIcon}
          text={`${bar.name} - ${Math.round(bar.distance)} m`} 
        >
      
        </MapMarkers>
      ))}



      <MapControls userPosition={positionUSer} />
      
    </MapContainer>
  )
}
