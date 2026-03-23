import './App.css'
import MapView from "./components/mapas/MapView"

import BottomNav from './components/navegation/bottomNavegation'
import { Serch } from './components/serch/Serch'
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

      <div className="h-[100dvh] w-full overflow-hidden relative">
        <MapView bars={bars} positionUser={positionUser} />
       
      
        <div className="absolute top-4 left-0 right-0 z-50">
         <Serch onSearch={handleSearch} />
        </div>

        <BottomNav
          active="map"
          onChange={(tab) => console.log(tab)}
        />
      </div>


    </>
  )
}

export default App
