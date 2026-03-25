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
      (err) => console.log(err),
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000
      }
    )

    return () => navigator.geolocation.clearWatch(watchId)
  }, [])

  return position
}
