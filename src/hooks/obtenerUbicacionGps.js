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
