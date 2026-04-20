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
  const storedEmail = getStoredEmail()
  const emailInitial = storedEmail?.trim()?.charAt(0)?.toUpperCase() || "U"

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
          <div className="absolute inset-0 z-[998] flex items-end justify-center bg-black/45 p-4 pb-[calc(5rem+env(safe-area-inset-bottom,0px))] backdrop-blur-[1.5px]">
            <div className="spot-profile-sheet w-full max-w-md rounded-2xl border border-white/10 bg-[#111317]/95 p-5 shadow-[0_16px_45px_rgba(0,0,0,0.45)] backdrop-blur-md">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-base font-semibold text-slate-100 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
                  {emailInitial}
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-slate-100">Perfil</h2>
                  <p className="text-xs text-slate-400">Sesion activa</p>
                </div>
              </div>
              <p className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-slate-300">
                {storedEmail ? (
                  <>
                    Sesion:{" "}
                    <span className="inline-block max-w-full truncate align-bottom font-medium text-slate-100">
                      {storedEmail}
                    </span>
                  </>
                ) : (
                  "Sesion iniciada"
                )}
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-4 h-11 w-full rounded-xl border-white/15 bg-white/[0.02] text-slate-200 transition-colors hover:bg-white/[0.06] hover:text-white"
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
                className="mt-2 h-11 w-full rounded-xl text-slate-400 hover:bg-white/[0.05] hover:text-slate-200"
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
