import { useEffect, useState } from "react"
/* navigator.geolocation.watchPosition para que actualice mientras caminás. */

/**
 * Si en .env definís VITE_DEV_LAT y VITE_DEV_LNG (números), se usan en lugar del GPS
 * para probar el mapa sin estar físicamente en el lugar del bar. Reiniciá `npm run dev` al cambiar.
 */

export default function ubicacionUsuario() {
  const [position, setPosition] = useState(null)

  useEffect(() => {
    const devLat = import.meta.env.VITE_DEV_LAT
    const devLng = import.meta.env.VITE_DEV_LNG
    if (devLat != null && devLat !== "" && devLng != null && devLng !== "") {
      const la = Number(devLat)
      const ln = Number(devLng)
      if (!Number.isNaN(la) && !Number.isNaN(ln)) {
        setPosition([la, ln])
        return
      }
    }

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
