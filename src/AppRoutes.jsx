import { Routes, Route, Navigate } from "react-router-dom"
import App from "./App.jsx"
import Login from "./pages/Login.jsx"
import Register from "./pages/Register.jsx"
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx"

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
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
