import { useRef, useState, useCallback, useEffect } from "react"
import Map, { Marker, Source, Layer } from "react-map-gl/maplibre"
import MapControls from "./MapControls"
import BarBottomCard from "./BarBottomCard"
import { distanceMeters } from "@/lib/geo"
import { cn } from "@/lib/utils"
import { fetchOsrmRoute } from "@/lib/osrmRoute"

export default function MapViewGL({ bars, positionUser }) {
  const mapRef = useRef(null)
  const [selectedBar, setSelectedBar] = useState(null)
  const [routeGeojson, setRouteGeojson] = useState(null)

  /** Al elegir un bar: pedir ruta por calles y mostrar solo la línea (sin mover la cámara). */
  useEffect(() => {
    if (!selectedBar || !positionUser) {
      setRouteGeojson(null)
      return
    }

    const lat = Number(selectedBar.lat)
    const lng = Number(selectedBar.lng)
    const [uLat, uLng] = positionUser
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      setRouteGeojson(null)
      return
    }

    let cancelled = false

    ;(async () => {
      try {
        const feature = await fetchOsrmRoute([uLng, uLat], [lng, lat], "driving")
        if (cancelled) return
        setRouteGeojson(feature ?? null)
      } catch (e) {
        console.error(e)
        if (!cancelled) setRouteGeojson(null)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [selectedBar, positionUser])

  const distanceForBar = useCallback(
    (bar) => {
      if (!bar || !positionUser) return null
      const lat = Number(bar.lat)
      const lng = Number(bar.lng)
      if (Number.isNaN(lat) || Number.isNaN(lng)) return null
      const raw = bar.distancia ?? bar.Distancia
      if (raw != null && Number.isFinite(Number(raw))) return Number(raw)
      const [uLat, uLng] = positionUser
      return distanceMeters(uLat, uLng, lat, lng)
    },
    [positionUser]
  )

  const openDirectionsExternas = useCallback(() => {
    if (!selectedBar || !positionUser) return
    const lat = Number(selectedBar.lat)
    const lng = Number(selectedBar.lng)
    const [uLat, uLng] = positionUser
    if (Number.isNaN(lat) || Number.isNaN(lng)) return
    const url = `https://www.google.com/maps/dir/?api=1&origin=${uLat},${uLng}&destination=${lat},${lng}&travelmode=driving`
    window.open(url, "_blank", "noopener,noreferrer")
  }, [selectedBar, positionUser])

  const handleMapClick = useCallback(() => {
    setSelectedBar(null)
  }, [])

  if (!positionUser) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        Cargando GPS...
      </div>
    )
  }

  return (
    <>
      <div
        className={cn(
          "h-full w-full",
          selectedBar && "spot-map-with-bar-card"
        )}
      >
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: positionUser[1],
          latitude: positionUser[0],
          zoom: 14,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="https://tiles.stadiamaps.com/styles/alidade_smooth.json"
        attributionControl={false}
        onClick={handleMapClick}
      >
        {routeGeojson ? (
          <Source id="route-to-bar" type="geojson" data={routeGeojson}>
            <Layer
              id="route-to-bar-line"
              type="line"
              paint={{
                "line-color": "#22d3ee",
                "line-width": 5,
                "line-opacity": 0.92,
              }}
            />
          </Source>
        ) : null}

        <Marker
          longitude={positionUser[1]}
          latitude={positionUser[0]}
          anchor="center"
        >
          <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-md text-xl pointer-events-none">
            🧭
          </div>
        </Marker>

        {Array.isArray(bars) &&
          bars.map((bar) => {
            const lat = Number(bar.lat)
            const lng = Number(bar.lng)
            if (Number.isNaN(lat) || Number.isNaN(lng)) return null
            const isSelected = selectedBar?.id_negocio === bar.id_negocio

            return (
              <Marker key={bar.id_negocio} longitude={lng} latitude={lat} anchor="center">
                <button
                  type="button"
                  className="map-marker-pin cursor-pointer border-0 bg-transparent p-0 outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedBar(bar)
                  }}
                  aria-label={`Ver ${bar.razon_social ?? "bar"}`}
                >
                  <div
                    className={
                      isSelected
                        ? "relative w-11 h-11 flex items-center justify-center scale-105 transition-transform"
                        : "relative w-10 h-10 flex items-center justify-center transition-transform"
                    }
                  >
                    <div className="absolute inset-0 rounded-full bg-cyan-500/20 border border-cyan-200/50" />
                    <div className="relative w-9 h-9 rounded-full bg-cyan-500/80 flex items-center justify-center shadow-md">
                      <span className="text-base leading-none">🍸</span>
                    </div>
                  </div>
                </button>
              </Marker>
            )
          })}

        <MapControls
          userPosition={positionUser}
          detailCardOpen={!!selectedBar}
        />
      </Map>
      </div>

      {selectedBar ? (
        <div
          className="pointer-events-none fixed inset-x-3 z-[998] bottom-[96px]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="pointer-events-auto">
            <BarBottomCard
              bar={selectedBar}
              distanceMeters={distanceForBar(selectedBar)}
              onClose={() => setSelectedBar(null)}
              onVerDetalles={() => {
                const d = selectedBar.direccion ?? ""
                alert(`${selectedBar.razon_social ?? "Bar"}\n${d}`.trim())
              }}
              onNavigate={openDirectionsExternas}
            />
          </div>
        </div>
      ) : null}
    </>
  )
}
