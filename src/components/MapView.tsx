"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { PetReport } from "@/lib/types";
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

export default function MapView({ reports }: { reports: PetReport[] }) {
  return (
    <MapContainer center={DEFAULT_CENTER} zoom={8} style={{ height: "100%", width: "100%" }}>
      <TileLayer url={tileUrl} attribution={tileAttribution} />
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
    </MapContainer>
  );
}
