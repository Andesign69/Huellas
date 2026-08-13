"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { PetReport, Shelter } from "@/lib/types";
import { DEFAULT_CENTER } from "@/lib/cities";

const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY;

const tileUrl = MAPTILER_KEY
  ? `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`
  : "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

const tileAttribution = MAPTILER_KEY
  ? '&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

const STATUS_COLOR: Record<string, string> = {
  perdido: "#B23A2E",
  encontrado: "#3F7A5C",
  en_refugio: "#2B6CA3",
};

function pinIcon(status: string) {
  const color = STATUS_COLOR[status] ?? "#7C8172";
  return L.divIcon({
    className: "",
    html: `<span style="display:block;width:14px;height:14px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 0 0 1px rgba(0,0,0,.25)"></span>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

const shelterIcon = L.divIcon({
  className: "",
  html: `<span style="display:flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:50%;background:#C9591F;border:2px solid white;box-shadow:0 0 0 1px rgba(0,0,0,.25)"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/></svg></span>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

// El viewport arranca centrado en DEFAULT_CENTER (Eje Cafetero, la zona más
// afectada por el sismo), pero eso deja fuera de cuadro cualquier reporte de
// otra ciudad (ej. Bogotá, Cali). Este componente ajusta el mapa a los
// marcadores reales una vez montado.
function FitToMarkers({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    // El contenedor puede no tener su tamaño final asentado todavía en este
    // punto (ej. recién se volvió visible al cambiar de pestaña Lista/Mapa),
    // y Leaflet cachea ese tamaño al medirlo — sin este invalidateSize(),
    // fitBounds/setView calculan el zoom contra dimensiones viejas.
    map.invalidateSize();
    // animate:false — esto es el ajuste inicial del viewport, no una
    // navegación del usuario, así que salta directo a la posición correcta
    // en vez de animar (evita quedarse a medio vuelo si el tab está en
    // segundo plano y el navegador pausa el rAF de la animación).
    if (points.length === 1) {
      map.setView(points[0], 14, { animate: false });
      return;
    }
    map.fitBounds(L.latLngBounds(points), { padding: [24, 24], maxZoom: 14, animate: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points.flat().join(",")]);
  return null;
}

export default function MapView({ reports, shelters = [] }: { reports: PetReport[]; shelters?: Shelter[] }) {
  const points: [number, number][] = [
    ...reports.map((r): [number, number] => [r.lat, r.lng]),
    ...shelters
      .filter((s): s is Shelter & { lat: number; lng: number } => s.lat != null && s.lng != null)
      .map((s): [number, number] => [s.lat, s.lng]),
  ];

  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={8}
      className="isolate"
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer url={tileUrl} attribution={tileAttribution} />
      <FitToMarkers points={points} />
      {reports.map((r) => (
        <Marker key={r.id} position={[r.lat, r.lng]} icon={pinIcon(r.status)}>
          <Popup>
            <strong className="capitalize">{r.species}</strong> · {r.status.replace("_", " ")}
            <br />
            {r.city}
            {r.description ? (
              <>
                <br />
                {r.description}
              </>
            ) : null}
          </Popup>
        </Marker>
      ))}
      {shelters
        .filter((s) => s.lat != null && s.lng != null)
        .map((s) => (
          <Marker key={s.id} position={[s.lat as number, s.lng as number]} icon={shelterIcon}>
            <Popup>
              <strong>{s.name}</strong>
              <br />
              {s.city}
              {!s.is_exact_location && (
                <>
                  <br />
                  <em>Ubicación aproximada</em>
                </>
              )}
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
}
