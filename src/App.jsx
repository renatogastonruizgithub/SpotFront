import { Navigate, Route, Routes } from "react-router-dom"
import MapaNegocios from "@/components/MapaNegocios"
import NeonDashboardPage from "@/pages/NeonDashboardPage"

export default function App() {
  return (
    <Routes>
      <Route path="/mapa" element={<MapaNegocios />} />
      <Route path="/dashboard" element={<NeonDashboardPage />} />
      <Route path="*" element={<Navigate to="/mapa" replace />} />
    </Routes>
  )
}
