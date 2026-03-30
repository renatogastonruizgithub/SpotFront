import './App.css'
import MapViewGL from "./components/mapas/MapViewGL"
import BottomNav from './components/navegation/bottomNavegation'
import { useState, useEffect, useRef } from 'react'
import { useGetNegocios } from './hooks/getNegocios'
import ubicacionUsuario from './hooks/obtenerUbicacionGps'

const RADIO_INICIAL_KM = (() => {
  const n = Number(import.meta.env.VITE_MAPA_RADIO_KM)
  return Number.isFinite(n) && n > 0 ? n : 10
})()

function App() {
  const [bars, setBars] = useState([])
  const { buscarNegociosCercanos } = useGetNegocios()
  const positionUser = ubicacionUsuario()

  const buscadoAlInicio = useRef(false)
  useEffect(() => {
    if (!positionUser || buscadoAlInicio.current) return
    buscadoAlInicio.current = true
    const [lat, lng] = positionUser
    ;(async () => {
      try {
        console.log(`Búsqueda inicial: radio ${RADIO_INICIAL_KM} km desde`, lat, lng)
        const data = await buscarNegociosCercanos(lat, lng, RADIO_INICIAL_KM)
        setBars(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error("Error buscando negocios:", error)
      }
    })()
  }, [positionUser])

  return (
    <>
      <div className="h-[100dvh] w-full overflow-hidden relative">
        <MapViewGL bars={bars} positionUser={positionUser} />

        <BottomNav
          active="map"
          onChange={(tab) => console.log(tab)}
        />
      </div>
    </>
  )
}

export default App
