import './App.css'
import MapView from "./components/mapas/MapView"
import NegociosCards from "./components/cards/NegociosCards"
import BottomNav from './components/navegation/bottomNavegation'
import { Serch } from './components/serch/Serch'
import { useState, useEffect, useRef } from 'react'
import { useGetNegocios } from './hooks/getNegocios'
import ubicacionUsuario from './hooks/obtenerUbicacionGps'

function App() {
  const [bars, setBars] = useState([])
  const { buscarNegociosCercanos } = useGetNegocios()
  const positionUser = ubicacionUsuario()

  const handleSearch = async (radiusKm) => {
    if (!positionUser) {
      alert("Esperando ubicación GPS...")
      return
    }

    const km = Number(radiusKm)
    const radio = Number.isFinite(km) && km > 0 ? km : 5

    try {
      const [lat, lng] = positionUser
      console.log(`Buscando en radio de ${radio} km desde`, lat, lng)
      const data = await buscarNegociosCercanos(lat, lng, radio)
      setBars(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error buscando negocios:", error)
    }
  }

  const buscadoAlInicio = useRef(false)
  useEffect(() => {
    if (!positionUser || buscadoAlInicio.current) return
    buscadoAlInicio.current = true
    const [lat, lng] = positionUser
    ;(async () => {
      try {
        console.log("Búsqueda inicial: radio 10 km desde", lat, lng)
        const data = await buscarNegociosCercanos(lat, lng, 10)
        setBars(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error("Error buscando negocios:", error)
      }
    })()
  }, [positionUser])

  return (
    <>
      <Serch onSearch={handleSearch} />
      <div style={{ position: "relative", height: "80vh", width: "100%", overflow: "hidden", marginTop: "1vh" }}>
        <MapView bars={bars} positionUser={positionUser} />
        {/* <NegociosCards bars={bars} /> */}
      </div>

      <BottomNav
        active="map"
        onChange={(tab) => console.log(tab)}
      />
    </>
  )
}

export default App
