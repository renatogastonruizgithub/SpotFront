import { useEffect, useState } from "react"
/* navigator.geolocation.watchPosition para que actualice mientras caminás. */


export default function ubicacionUsuario() {
  const [position, setPosition] = useState(null)

  useEffect(() => {
    if (!navigator.geolocation) return

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition([
          pos.coords.latitude,
          pos.coords.longitude
        ])
      },
      (err) => {
        const codes = { 1: "PERMISSION_DENIED", 2: "POSITION_UNAVAILABLE", 3: "TIMEOUT" }
        console.warn(
          "[GPS]",
          codes[err.code] ?? err.code,
          err.message,
          "— Permití ubicación en el navegador o usá https/localhost."
        )
      },
      {
        enableHighAccuracy: true,
        maximumAge: 30_000,
        timeout: 15_000
      }
    )

    return () => navigator.geolocation.clearWatch(watchId)
  }, [])

  return position
}
