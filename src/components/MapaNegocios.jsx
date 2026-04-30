import { useState, useEffect, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";

const API_BASE = "http://localhost:53957/api";

const iconUsuario = L.divIcon({
  className: "custom-marker",
  html: '<div style="background:#00D1FF;width:20px;height:20px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,209,255,0.4);"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const iconNegocio = L.divIcon({
  className: "custom-marker",
  html: '<div style="width:34px;height:34px;border-radius:50%;background:rgba(0,209,255,0.9);border:2px solid rgba(126,239,255,0.95);display:flex;align-items:center;justify-content:center;font-size:17px;line-height:1;color:#fff;box-shadow:0 2px 12px rgba(0,209,255,0.35);">🍸</div>',
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

// Componente interno para centrar el mapa cuando cambia la posición
function MapUpdater({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);
  return null;
}

export default function MapaNegocios() {
  const [posicionUsuario, setPosicionUsuario] = useState(null);
  const [negocios, setNegocios] = useState([]);
  const [radioKm, setRadioKm] = useState(2);
  const [cargando, setCargando] = useState(true);
  const [errorGeo, setErrorGeo] = useState(null);
  const [buscando, setBuscando] = useState(false);

  const centroPorDefecto = [-31.4135, -64.1811];
  const zoomPorDefecto = 13;

  useEffect(() => {
    if (!navigator.geolocation) {
      setErrorGeo("Tu navegador no soporta geolocalización.");
      setCargando(false);
      setPosicionUsuario(centroPorDefecto);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosicionUsuario([pos.coords.latitude, pos.coords.longitude]);
        setErrorGeo(null);
        setCargando(false);
      },
      (err) => {
        setErrorGeo(err.message || "No se pudo obtener tu ubicación.");
        setPosicionUsuario(centroPorDefecto);
        setCargando(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  const buscarNegocios = useCallback(async () => {
    const [lat, lng] = posicionUsuario ?? centroPorDefecto;
    setBuscando(true);
    try {
      const res = await fetch(
        `${API_BASE}/negocios/cercanos?lat=${lat}&lng=${lng}&radioKm=${radioKm}`
      );
      if (!res.ok) throw new Error("Error al obtener negocios");
      const data = await res.json();
      setNegocios(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setNegocios([]);
    } finally {
      setBuscando(false);
    }
  }, [posicionUsuario, radioKm]);

  const center = posicionUsuario ?? centroPorDefecto;

  return (
    <div className="fixed inset-0 w-full h-full flex flex-col">
      {/* Panel de controles */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-wrap items-center gap-2 bg-background/95 backdrop-blur rounded-lg shadow-lg p-3 border">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Radio (km):</label>
          <input
            type="number"
            min="0.1"
            max="50"
            step="0.5"
            value={radioKm}
            onChange={(e) => setRadioKm(parseFloat(e.target.value) || 1)}
            className="w-20 px-2 py-1.5 rounded-md border border-input bg-background text-foreground text-sm"
          />
        </div>
        <Button
          onClick={buscarNegocios}
          disabled={buscando || !posicionUsuario}
          size="sm"
        >
          {buscando ? "Buscando..." : "Buscar"}
        </Button>
        {errorGeo && (
          <span className="text-sm text-amber-600 dark:text-amber-400">
            {errorGeo}
          </span>
        )}
      </div>

      {/* Mapa */}
      <div className="flex-1 min-h-0">
        {cargando ? (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <p className="text-muted-foreground">Detectando ubicación...</p>
          </div>
        ) : (
          <MapContainer
            center={center}
            zoom={zoomPorDefecto}
            className="h-full w-full"
            scrollWheelZoom={true}
          >
            <MapUpdater center={center} zoom={zoomPorDefecto} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Usuario */}
            {posicionUsuario && (
              <Marker position={posicionUsuario} icon={iconUsuario}>
                <Popup>Tu ubicación actual</Popup>
              </Marker>
            )}

            {/* Círculo del radio de búsqueda */}
            {posicionUsuario && (
              <Circle
                center={posicionUsuario}
                radius={radioKm * 1000}
                pathOptions={{
                  color: "#00D1FF",
                  fillColor: "#00D1FF",
                  fillOpacity: 0.12,
                  weight: 2,
                }}
              />
            )}

            {/* Negocios */}
            {negocios.map((neg) => (
              <Marker
                key={neg.id_negocio}
                position={[neg.lat, neg.lng]}
                icon={iconNegocio}
              >
                <Popup>
                  <div className="min-w-[180px]">
                    <p className="font-semibold text-foreground">
                      {neg.razon_social}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {neg.direccion}
                    </p>
                    <p className="text-sm text-primary mt-1">
                      {Math.round(neg.distancia)} m
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>
    </div>
  );
}
