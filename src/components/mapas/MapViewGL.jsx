import { useRef } from "react"
import Map, { Marker } from "react-map-gl/maplibre"
import MapControls from "./MapControls"

export default function MapViewGL({ bars, positionUser }) {
  const mapRef = useRef(null)

  if (!positionUser) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        Cargando GPS...
      </div>
    )
  }

  return (
    <Map
      ref={mapRef}
      initialViewState={{
        longitude: positionUser[1],
        latitude: positionUser[0],
        zoom: 14,
      }}
      style={{ width: "100%", height: "100%" }}
      mapStyle="https://tiles.stadiamaps.com/styles/alidade_smooth.json" //"https://tiles.stadiamaps.com/styles/alidade_smooth_dark.json"
      attributionControl={false}
    >
      {/* Usuario */}
      <Marker
        longitude={positionUser[1]}
        latitude={positionUser[0]}
        anchor="center"
      >
        <div className="text-2xl">📍</div>
      </Marker>

   

      {/* Bares */}
      {Array.isArray(bars) &&
        bars.map((bar) => {
          const lat = Number(bar.lat)
          const lng = Number(bar.lng)
          if (isNaN(lat) || isNaN(lng)) return null

          return (
            <Marker
              key={bar.id_negocio}
              longitude={lng}
              latitude={lat}
              anchor="center"
            >
              <div className="text-2xl">🍺</div>
            </Marker>
          )
        })}

   
        <MapControls userPosition={positionUser} />
    </Map>
  )
}