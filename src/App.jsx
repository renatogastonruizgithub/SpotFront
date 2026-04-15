import "./App.css"
import MapViewGL from "./components/mapas/MapViewGL"
import BottomNav from "./components/navegation/bottomNavegation"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useGetNegocios } from "./hooks/getNegocios"
import ubicacionUsuario from "./hooks/obtenerUbicacionGps"
import { getStoredEmail, logout } from "./services/authService"

const RADIO_INICIAL_KM = (() => {
  const n = Number(import.meta.env.VITE_MAPA_RADIO_KM)
  return Number.isFinite(n) && n > 0 ? n : 10
})()

function App() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("map")
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
      <div className="relative h-[100dvh] w-full overflow-hidden">
        <MapViewGL bars={bars} positionUser={positionUser} />

        {activeTab === "perfil" ? (
          <div className="absolute inset-0 z-[998] flex items-end justify-center bg-black/55 p-4 pb-[calc(5rem+env(safe-area-inset-bottom,0px))]">
            <div className="w-full max-w-md rounded-xl border border-white/10 bg-[#111418]/98 p-5 shadow-xl backdrop-blur-md">
              <h2 className="text-lg font-medium text-[#00D1FF]">Perfil</h2>
              <p className="mt-2 text-sm text-gray-400">
                {getStoredEmail() ? (
                  <>
                    Sesión:{" "}
                    <span className="text-gray-200">{getStoredEmail()}</span>
                  </>
                ) : (
                  "Sesión iniciada"
                )}
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-4 w-full border-red-500/40 text-red-400 hover:bg-red-500/10"
                onClick={() => {
                  logout()
                  navigate("/login", { replace: true })
                }}
              >
                Cerrar sesión
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="mt-2 w-full text-gray-400"
                onClick={() => setActiveTab("map")}
              >
                Volver al mapa
              </Button>
            </div>
          </div>
        ) : null}

        <BottomNav active={activeTab} onChange={setActiveTab} />
      </div>
    </>
  )
}

export default App
