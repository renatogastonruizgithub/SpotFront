import { Navigate, useLocation } from "react-router-dom"
import {
  getHomeRouteByRole,
  getOnboardingChoice,
  isAuthenticated,
} from "@/services/authService"

export default function ProtectedRoute({ children }) {
  const location = useLocation()
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  // Si está autenticado pero aún no eligió uso, forzamos onboarding una sola vez.
  const onboardingChoice = getOnboardingChoice()
  if (!onboardingChoice && location.pathname !== "/seleccionar-uso") {
    return <Navigate to="/seleccionar-uso" replace />
  }

  // Si ya eligió y entra manualmente a /seleccionar-uso, lo mandamos a su home por rol.
  if (onboardingChoice && location.pathname === "/seleccionar-uso") {
    return <Navigate to={getHomeRouteByRole()} replace />
  }

  return children
}
