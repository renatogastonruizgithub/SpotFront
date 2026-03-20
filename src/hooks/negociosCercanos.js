import { useMemo } from "react"

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000 // metros

  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

export default function useNegociosCercanos(userPosition, bars, radius = 500) {

  return useMemo(() => {
    if (!userPosition) return []

    const [lat, lng] = userPosition

    return bars
      .map(bar => {
        const distance = haversineDistance(
          lat,
          lng,
          bar.lat,
          bar.lng
        )

        return { ...bar, distance }
      })
      .filter(bar => bar.distance <= radius)
      .sort((a, b) => a.distance - b.distance)

  }, [userPosition, bars, radius])
}