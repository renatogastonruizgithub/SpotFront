import { useEffect, useRef } from "react"

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371000

  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

export default function useDistanceTracker(onTrigger, threshold = 100) {
  const lastPosition = useRef(null)
  const accumulated = useRef(0)

  useEffect(() => {
    if (!navigator.geolocation) return

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords

        if (!lastPosition.current) {
          lastPosition.current = [latitude, longitude]
          return
        }

        const [prevLat, prevLng] = lastPosition.current

        const dist = haversine(prevLat, prevLng, latitude, longitude)

        accumulated.current += dist

        lastPosition.current = [latitude, longitude]

        // al acumular el umbral (p. ej. 100 m)
        if (accumulated.current >= threshold) {
          onTrigger(accumulated.current)

          accumulated.current = 0
        }
      },
      (err) => console.log(err),
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000
      }
    )

    return () => navigator.geolocation.clearWatch(watchId)
  }, [onTrigger, threshold])
}