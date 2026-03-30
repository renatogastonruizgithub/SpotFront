/**
 * Posición del usuario en el mapa (estilo limpio tipo Uber/Google: punto + halo suave).
 */
export default function UserLocationMarker() {
  return (
    <div className="spot-user-marker" aria-hidden>
      <div className="spot-user-marker__inner">
        <div className="spot-user-marker__halo" />
        <div className="spot-user-marker__dot" />
      </div>
    </div>
  )
}
