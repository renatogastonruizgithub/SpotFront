import './App.css'
import MapView from "./components/mapas/MapView"
import NegociosCards from "./components/cards/negociosCards"
import BottomNav from './components/navegation/bottomNavegation'
import { Serch } from './components/serch/serch'
import { useState } from 'react'
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

    try {
      const [lat, lng] = positionUser
      console.log(`Buscando en radio de ${radiusKm}km desde`, lat, lng)
      const data = await buscarNegociosCercanos(lat, lng, radiusKm)
      setBars(data)
    } catch (error) {
      console.error("Error buscando negocios:", error)
    }
  }

  return (
    <>
      <Serch onSearch={handleSearch} />
      <div style={{ position: "relative", height: "80vh",width:"100%", overflow: "hidden",marginTop:"1vh" }}>
      <MapView bars={bars} positionUser={positionUser} />
    {/*     <NegociosCards bars={bars} /> */}
      </div>
  
      <BottomNav
        active="map"
        onChange={(tab) => console.log(tab)}
      />
    </>
  )
}

export default App
