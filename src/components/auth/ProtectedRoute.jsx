import { Navigate, useLocation } from "react-router-dom"
import {
  getHomeRouteByRole,
  hasRoleGateOverride,
  isAuthenticated,
  needsRoleAssignment,
} from "@/services/authService"

export default function ProtectedRoute({ children }) {
  const location = useLocation()
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  const pendingRole = needsRoleAssignment()
  const override = hasRoleGateOverride()
  const onSelectPage = location.pathname === "/seleccionar-uso"

  if (pendingRole && !override && !onSelectPage) {
    return <Navigate to="/seleccionar-uso" replace />
  }

  if ((!pendingRole || override) && onSelectPage) {
    return <Navigate to={getHomeRouteByRole()} replace />
  }

  return children
}
