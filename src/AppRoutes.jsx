import { Routes, Route, Navigate } from "react-router-dom"
import App from "./App.jsx"
import Login from "./pages/Login.jsx"
import Register from "./pages/Register.jsx"
import SelectUsage from "./pages/SelectUsage.jsx"
import RecoverPassword from "./pages/RecoverPassword.jsx"
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx"

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/recuperar-contraseña" element={<RecoverPassword />} />
      {/* Pantalla de selección de uso: se usa en registro y también post-login onboarding. */}
      <Route path="/seleccionar-uso" element={<SelectUsage />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <App />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
